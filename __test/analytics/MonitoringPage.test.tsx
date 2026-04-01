import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";

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

jest.mock("@/components/emptyStates/emptyStates", () => ({
  __esModule: true,
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

const mockUseMonitoringMetrics = jest.fn();

jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useMonitoringMetrics: (...args: any[]) => mockUseMonitoringMetrics(...args),
}));

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

jest.mock("@/components/SelectedDevices", () => {
  return {
    __esModule: true,
    default: ({
      heading,
      subheading,
      onSelectionChange,
      timeRange,
      orgId,
      isLoading,
    }: any) => {
      React.useEffect(() => {
        if (onSelectionChange && !isLoading) {
          onSelectionChange(new Set(["device-1", "device-2"]));
        }
      }, [onSelectionChange, isLoading]);

      return (
        <div
          data-testid="selected-devices"
          data-time-range={timeRange}
          data-org-id={orgId}
        >
          <div>{heading}</div>
          <div>{subheading}</div>
          {!isLoading && <span>Selected Devices (2)</span>}
        </div>
      );
    },
  };
});

jest.mock("@/components/DowntimeChart", () => ({
  __esModule: true,
  default: ({ orgId, timeRange, selectedDevices }: any) => (
    <div
      data-testid="downtime-chart"
      data-org-id={orgId}
      data-time-range={timeRange}
    >
      <div className="font-semibold text-[20px] text-[#090814] mb-0.5">
        Downtime
      </div>
      <div data-testid="downtime-chart-content">Downtime Chart Content</div>
    </div>
  ),
}));

jest.mock("@/components/AlertChart", () => ({
  __esModule: true,
  default: ({ orgId, timeRange, selectedDevices }: any) => (
    <div
      data-testid="alerts-chart"
      data-org-id={orgId}
      data-time-range={timeRange}
    >
      <div className="font-semibold text-[20px] text-[#090814] mb-0.5">
        Alerts
      </div>
      <div data-testid="alerts-chart-content">Alerts Chart Content</div>
    </div>
  ),
}));

jest.mock("@/components/skeleton/LineChartSkeleton", () => ({
  __esModule: true,
  default: ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => (
    <div data-testid="line-chart-skeleton" data-title={title}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

jest.mock("@/components/skeleton/AreaChartSkeleton", () => ({
  __esModule: true,
  default: ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => (
    <div data-testid="area-chart-skeleton" data-title={title}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

import MonitoringPage from "@/components/analytics/monitoring/page";

const renderPage = (orgId = "test-org-123") =>
  render(<MonitoringPage orgId={orgId} />);

// Wait for loading to complete
const waitForLoad = async () => {
  await act(async () => {
    jest.advanceTimersByTime(900); // Component uses 800ms
  });
};

describe("MonitoringPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();

    // Default mock implementations
    mockUseMonitoringMetrics.mockReturnValue({ ready: true });
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
    it("shows LineChartSkeleton for Downtime before load", () => {
      renderPage();
      expect(screen.getByTestId("line-chart-skeleton")).toBeInTheDocument();
      expect(screen.getByText("Downtime")).toBeInTheDocument();
    });

    it("shows AreaChartSkeleton for Alerts before load", () => {
      renderPage();
      expect(screen.getByTestId("area-chart-skeleton")).toBeInTheDocument();
      expect(screen.getByText("Alerts")).toBeInTheDocument();
    });

    it("SelectedDevices is always visible (not behind load gate)", () => {
      renderPage();
      expect(screen.getByTestId("selected-devices")).toBeInTheDocument();
    });

    it("charts are NOT rendered before 800 ms", () => {
      renderPage();
      expect(screen.queryByTestId("downtime-chart")).not.toBeInTheDocument();
      expect(screen.queryByTestId("alerts-chart")).not.toBeInTheDocument();
    });
  });

  // ── Loaded state (after 800ms) ───────────────────────────────────────────────
  describe("loaded state", () => {
    it("renders DowntimeChart after load", async () => {
      renderPage();
      await waitForLoad();
      expect(screen.getByTestId("downtime-chart")).toBeInTheDocument();
      expect(screen.getByText("Downtime")).toBeInTheDocument();
    });

    it("renders AlertsChart after load", async () => {
      renderPage();
      await waitForLoad();
      expect(screen.getByTestId("alerts-chart")).toBeInTheDocument();
      expect(screen.getByText("Alerts")).toBeInTheDocument();
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
});
