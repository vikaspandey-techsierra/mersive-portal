/**
 * @file MonitoringPage.test.tsx
 * Tests for the MonitoringPage orchestrator component.
 *
 * Mirrors the pattern of UsagePage.test.tsx — mocks all children,
 * focuses on: heading, time-range buttons, loading/loaded state,
 * skeleton → chart transitions, data-point counts, and tick intervals.
 */

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
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
    XAxis: ({ interval }: { interval?: number }) => (
      <div data-testid="x-axis" data-interval={interval} />
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

import MonitoringPage from "@/components/analytics/monitoring/page";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderPage = () => render(<MonitoringPage />);

const getChartPoints = (testId: string) =>
  parseInt(screen.getByTestId(testId).getAttribute("data-points") ?? "0", 10);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("MonitoringPage", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
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

  // ── Loading state (before 1s) ─────────────────────────────────────────────
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
      expect(screen.getByText("Selected Devices (5)")).toBeInTheDocument();
    });

    it("charts are NOT rendered before 1 s", () => {
      renderPage();
      // line-chart and area-chart are from recharts mocks — only appear after load
      expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
      expect(screen.queryByTestId("area-chart")).not.toBeInTheDocument();
    });
  });

  // ── Loaded state (after 1s) ───────────────────────────────────────────────
  describe("loaded state", () => {
    it("renders DowntimeChart (line-chart) after 1 s", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("renders AlertsChart (area-chart) after 1 s", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });

    it("Downtime h2 heading is present after load (from DowntimeChart)", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      expect(
        screen.getByRole("heading", { name: "Downtime" })
      ).toBeInTheDocument();
    });
  });

  // ── Time range switching ──────────────────────────────────────────────────
  describe("time range switching", () => {
    it("clicking a range sets it as active", () => {
      renderPage();
      fireEvent.click(screen.getByText("Last 30 days"));
      expect(screen.getByText("Last 30 days").className).toMatch(
        /bg-\[#6860C8\]/
      );
      expect(screen.getByText("Last 7 days").className).not.toMatch(
        /bg-\[#6860C8\]/
      );
    });

    it("all 5 ranges are individually selectable", () => {
      renderPage();
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

    it("switching back to 7d restores its active styling", () => {
      renderPage();
      fireEvent.click(screen.getByText("Last 30 days"));
      fireEvent.click(screen.getByText("Last 7 days"));
      expect(screen.getByText("Last 7 days").className).toMatch(
        /bg-\[#6860C8\]/
      );
    });
  });

  // ── Mock data integrity via data-points attribute ─────────────────────────
  describe("mock data counts per range", () => {
    it("7d → 7 downtime points", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      expect(getChartPoints("line-chart")).toBe(7);
    });

    it("30d → 30 downtime points", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      fireEvent.click(screen.getByText("Last 30 days"));
      expect(getChartPoints("line-chart")).toBe(30);
    });

    it("60d → 60 downtime points", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      fireEvent.click(screen.getByText("Last 60 days"));
      expect(getChartPoints("line-chart")).toBe(60);
    });

    it("90d → 90 downtime points", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      fireEvent.click(screen.getByText("Last 90 days"));
      expect(getChartPoints("line-chart")).toBe(90);
    });

    it("All time → 120 downtime points", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      fireEvent.click(screen.getByText("All time"));
      expect(getChartPoints("line-chart")).toBe(120);
    });

    it("alert data length always matches downtime data length", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      expect(getChartPoints("line-chart")).toBe(getChartPoints("area-chart"));
    });
  });

  // ── Tick interval via XAxis data-interval ─────────────────────────────────
  describe("tick intervals", () => {
    it("7d has interval 0 (no ticks skipped)", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      // Two XAxis elements (one per chart); both should have interval 0
      expect(screen.getAllByTestId("x-axis")[0]).toHaveAttribute(
        "data-interval",
        "0"
      );
    });

    it("interval grows from 30d to 90d", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      fireEvent.click(screen.getByText("Last 30 days"));
      const i30 = parseInt(
        screen.getAllByTestId("x-axis")[0].getAttribute("data-interval") ?? "0",
        10
      );
      fireEvent.click(screen.getByText("Last 90 days"));
      const i90 = parseInt(
        screen.getAllByTestId("x-axis")[0].getAttribute("data-interval") ?? "0",
        10
      );
      expect(i90).toBeGreaterThan(i30);
    });

    it("interval is always a non-negative integer", () => {
      renderPage();
      act(() => jest.advanceTimersByTime(1000));
      [
        "Last 7 days",
        "Last 30 days",
        "Last 60 days",
        "Last 90 days",
        "All time",
      ].forEach((label) => {
        fireEvent.click(screen.getByText(label));
        const val = parseInt(
          screen.getAllByTestId("x-axis")[0].getAttribute("data-interval") ??
            "-1",
          10
        );
        expect(val).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(val)).toBe(true);
      });
    });
  });
});
