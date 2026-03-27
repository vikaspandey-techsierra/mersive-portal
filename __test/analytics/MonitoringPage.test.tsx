/**
 * @file MonitoringPage.test.tsx
 * Tests for the MonitoringPage orchestrator component.
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// Mock recharts (needed because DowntimeChart / AlertsChart import it)
// ---------------------------------------------------------------------------
jest.mock("recharts", () => {
  const actual = jest.requireActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({
      children,
      data,
    }: {
      children: React.ReactNode;
      data: unknown[];
    }) => (
      <div data-testid="line-chart" data-points={data?.length}>
        {children}
      </div>
    ),
    AreaChart: ({
      children,
      data,
    }: {
      children: React.ReactNode;
      data: unknown[];
    }) => (
      <div data-testid="area-chart" data-points={data?.length}>
        {children}
      </div>
    ),
    Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
      <div data-testid={`line-${dataKey}`} data-stroke={stroke} />
    ),
    Area: ({ dataKey }: { dataKey: string }) => (
      <div data-testid={`area-${dataKey}`} />
    ),
    XAxis: ({ ticks }: { ticks?: string[] }) => (
      <div data-testid="x-axis" data-ticks={ticks?.join(",")} />
    ),
    YAxis: ({
      yAxisId,
      label,
    }: {
      yAxisId?: string;
      label?: React.ReactElement;
    }) => {
      const fakeViewBox = { x: 10, y: 10, width: 200, height: 200 };
      return (
        <div data-testid={yAxisId ? `y-axis-${yAxisId}` : "y-axis"}>
          {label
            ? React.cloneElement(label, { viewBox: fakeViewBox } as object)
            : null}
        </div>
      );
    },
    CartesianGrid: () => <div />,
    ReferenceLine: () => <div />,
    Tooltip: () => <div />,
  };
});

// ---------------------------------------------------------------------------
// Mock data for the charts
// ---------------------------------------------------------------------------
const mockDowntimeData = [
  { date: "2026-02-26", devices: 9, hours: 1.45 },
  { date: "2026-02-27", devices: 13, hours: 1.65 },
  { date: "2026-02-28", devices: 3, hours: 1.15 },
];

const mockAlertsData = [
  { date: "2026-02-26", value: 5 },
  { date: "2026-02-27", value: 8 },
  { date: "2026-02-28", value: 3 },
];

// ---------------------------------------------------------------------------
// Mock the hooks
// ---------------------------------------------------------------------------
const mockUseMonitoringMetrics = jest.fn();
const mockUseFilteredDowntimePoints = jest.fn();
const mockUseFilteredAlertsPoints = jest.fn();
const mockUseFilteredChartPoints = jest.fn();
const mockUseFilteredCollaborationMetrics = jest.fn();
const mockUseDeviceUtilizationMetrics = jest.fn();

jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useMonitoringMetrics: (...args: any[]) => mockUseMonitoringMetrics(...args),
  useFilteredDowntimePoints: (...args: any[]) =>
    mockUseFilteredDowntimePoints(...args),
  useFilteredAlertsPoints: (...args: any[]) =>
    mockUseFilteredAlertsPoints(...args),
  useFilteredChartPoints: (...args: any[]) =>
    mockUseFilteredChartPoints(...args),
  useFilteredCollaborationMetrics: (...args: any[]) =>
    mockUseFilteredCollaborationMetrics(...args),
  useDeviceUtilizationMetrics: (...args: any[]) =>
    mockUseDeviceUtilizationMetrics(...args),
}));

// Mock the helpers
jest.mock("@/lib/analytics/utils/helpers", () => ({
  formatShortDate: (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },
  getSevenTicks: (labels: string[]) => {
    if (labels.length === 0) return [];
    const step = Math.max(1, Math.floor(labels.length / 7));
    return labels.filter((_, i) => i % step === 0).slice(0, 7);
  },
}));

import MonitoringPage from "@/components/analytics/monitoring/page";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderPage = () => render(<MonitoringPage />);

const getChartPoints = (testId: string) =>
  parseInt(screen.getByTestId(testId).getAttribute("data-points") ?? "0", 10);

// Wait for loading to complete
const waitForLoad = async () => {
  await act(async () => {
    jest.advanceTimersByTime(900); // Component uses 800ms
  });
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("MonitoringPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    // Default mock implementations
    mockUseMonitoringMetrics.mockReturnValue({ ready: true });
    mockUseFilteredDowntimePoints.mockReturnValue(mockDowntimeData);
    mockUseFilteredAlertsPoints.mockReturnValue(mockAlertsData);
    mockUseFilteredChartPoints.mockReturnValue([]);
    mockUseFilteredCollaborationMetrics.mockReturnValue({
      connectionsAvg: [],
      postsAvg: [],
    });
    mockUseDeviceUtilizationMetrics.mockReturnValue({ dataA: [], dataB: [] });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // ── Initial render ────────────────────────────────────────────────────────
  describe("initial render", () => {
    it('shows the "Monitoring" heading', () => {
      renderPage();
      expect(screen.getByText("Monitoring")).toBeInTheDocument();
    });

    it("renders all 5 time-range buttons", () => {
      renderPage();
      [
        "Last 7 days",
        "Last 30 days",
        "Last 60 days",
        "Last 90 days",
        "All time",
      ].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
    });

    it('defaults to "Last 7 days" as the active range', () => {
      renderPage();
      expect(screen.getByText("Last 7 days").className).toMatch(
        /bg-\[#6860C8\]/
      );
    });

    it("inactive time-range buttons do not have the active class", () => {
      renderPage();
      ["Last 30 days", "Last 60 days", "Last 90 days", "All time"].forEach(
        (label) => {
          expect(screen.getByText(label).className).not.toMatch(
            /bg-\[#6860C8\]/
          );
        }
      );
    });
  });

  // ── Loading state (before 800ms) ─────────────────────────────────────────────
  describe("loading state", () => {
    it("shows LineChartSkeleton heading for Downtime before load", () => {
      renderPage();
      expect(
        screen.getByRole("heading", { name: "Downtime" })
      ).toBeInTheDocument();
    });

    it("shows AreaChartSkeleton heading for Alerts before load", () => {
      renderPage();
      expect(screen.getByText("Alerts")).toBeInTheDocument();
    });

    it("SelectedDevices is always visible (not behind load gate)", () => {
      renderPage();
      expect(screen.getByText(/Selected Devices \(\d+\)/)).toBeInTheDocument();
    });

    it("charts are NOT rendered before 800 ms", () => {
      renderPage();
      expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
      expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
    });
  });

  // ── Loaded state (after 800ms) ───────────────────────────────────────────────
  describe("loaded state", () => {
    it("renders DowntimeChart (line-chart) after load", async () => {
      renderPage();
      await waitForLoad();
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("renders AlertsChart (area-chart) after load", async () => {
      renderPage();
      await waitForLoad();
      expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });

    it("Downtime h2 heading is present after load (from DowntimeChart)", async () => {
      renderPage();
      await waitForLoad();
      expect(
        screen.getByRole("heading", { name: "Downtime" })
      ).toBeInTheDocument();
    });
  });

  // ── Time range switching ──────────────────────────────────────────────────
  describe("time range switching", () => {
    it("clicking a range sets it as active", async () => {
      renderPage();
      await waitForLoad();
      fireEvent.click(screen.getByText("Last 30 days"));
      expect(screen.getByText("Last 30 days").className).toMatch(
        /bg-\[#6860C8\]/
      );
      expect(screen.getByText("Last 7 days").className).not.toMatch(
        /bg-\[#6860C8\]/
      );
    });

    it("all 5 ranges are individually selectable", async () => {
      renderPage();
      await waitForLoad();
      [
        "Last 7 days",
        "Last 30 days",
        "Last 60 days",
        "Last 90 days",
        "All time",
      ].forEach((label) => {
        fireEvent.click(screen.getByText(label));
        expect(screen.getByText(label).className).toMatch(/bg-\[#6860C8\]/);
      });
    });

    it("switching back to 7d restores its active styling", async () => {
      renderPage();
      await waitForLoad();
      fireEvent.click(screen.getByText("Last 30 days"));
      fireEvent.click(screen.getByText("Last 7 days"));
      expect(screen.getByText("Last 7 days").className).toMatch(
        /bg-\[#6860C8\]/
      );
    });
  });

  // ── Mock data integrity via data-points attribute ─────────────────────────
  describe("mock data counts per range", () => {
    it("displays correct number of data points", async () => {
      renderPage();
      await waitForLoad();
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        mockDowntimeData.length.toString()
      );
    });
  });

  // ── XAxis rendering ─────────────────────────────────────────────────
  describe("XAxis rendering", () => {
    it("XAxis is rendered after load", async () => {
      renderPage();
      await waitForLoad();
      const xAxes = screen.getAllByTestId("x-axis");
      expect(xAxes.length).toBeGreaterThan(0);
    });

    it("XAxis has ticks attribute", async () => {
      renderPage();
      await waitForLoad();
      const xAxes = screen.getAllByTestId("x-axis");
      xAxes.forEach((xAxis) => {
        const ticks = xAxis.getAttribute("data-ticks");
        // The XAxis should have ticks (may be empty array if no data)
        expect(ticks).not.toBeNull();
      });
    });
  });
});
