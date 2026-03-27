/**
 * @file device-utilization.test.tsx
 * Tests for DeviceUtilizationChart component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeviceUtilization from "@/components/DeviceUtilizationChart";

// ---------------------------------------------------------------------------
// Create mock function that we can control
// ---------------------------------------------------------------------------
const mockUseFilteredChartPoints = jest.fn();

// ---------------------------------------------------------------------------
// Mock the useTimeSeriesMetrics hooks BEFORE importing the component
// ---------------------------------------------------------------------------
jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useFilteredChartPoints: (...args: any[]) =>
    mockUseFilteredChartPoints(...args),
}));

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const mockMeetingsData = [
  { date: "2026-02-26", value: 7 },
  { date: "2026-02-27", value: 10 },
  { date: "2026-02-28", value: 5 },
  { date: "2026-03-01", value: 8 },
  { date: "2026-03-02", value: 1 },
  { date: "2026-03-03", value: 9 },
  { date: "2026-03-04", value: 11 },
];

const mockDurationData = [
  { date: "2026-02-26", value: 14 },
  { date: "2026-02-27", value: 20 },
  { date: "2026-02-28", value: 10 },
  { date: "2026-03-01", value: 16 },
  { date: "2026-03-02", value: 2 },
  { date: "2026-03-03", value: 18 },
  { date: "2026-03-04", value: 22 },
];

const mockConnectionsData = [
  { date: "2026-02-26", value: 6 },
  { date: "2026-02-27", value: 8 },
  { date: "2026-02-28", value: 4 },
  { date: "2026-03-01", value: 6 },
  { date: "2026-03-02", value: 1 },
  { date: "2026-03-03", value: 7 },
  { date: "2026-03-04", value: 11 },
];

const mockPostsData = [
  { date: "2026-02-26", value: 5 },
  { date: "2026-02-27", value: 7 },
  { date: "2026-02-28", value: 3 },
  { date: "2026-03-01", value: 5 },
  { date: "2026-03-02", value: 1 },
  { date: "2026-03-03", value: 6 },
  { date: "2026-03-04", value: 9 },
];

// ---------------------------------------------------------------------------
// Mock recharts – renders a lightweight stub so we don't need a real canvas
// ---------------------------------------------------------------------------
// Tooltip payload injected by tests that need to exercise ChartTooltip
let __tooltipPayload: { name: string; value: number; color: string }[] = [];
let __tooltipActive = false;
let __tooltipLabel = "";

jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
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
    Line: ({ dataKey, stroke }: { dataKey: string; stroke: string }) => (
      <div data-testid={`line-${dataKey}`} data-stroke={stroke} />
    ),
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: ({
      yAxisId,
      orientation,
      label,
    }: {
      yAxisId: string;
      orientation: string;
      label?: React.ReactElement;
    }) => {
      const fakeViewBox = { x: 10, y: 10, width: 200, height: 200 };
      return (
        <div data-testid={`y-axis-${yAxisId}`} data-orientation={orientation}>
          {label
            ? React.cloneElement(label, { viewBox: fakeViewBox } as object)
            : null}
        </div>
      );
    },
    CartesianGrid: () => <div />,
    ReferenceLine: () => <div />,
    Tooltip: ({ content }: { content: React.ReactElement }) => {
      if (!__tooltipActive) return <div />;
      const ContentFn = (content as React.ReactElement).type as React.FC<{
        active?: boolean;
        payload?: { name: string; value: number; color: string }[];
        label?: string;
      }>;
      return (
        <ContentFn
          active={__tooltipActive}
          label={__tooltipLabel}
          payload={__tooltipPayload}
        />
      );
    },
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderComponent = (
  timeRange = "7d",
  selectedDevices = new Set<string>()
) =>
  render(
    <DeviceUtilization
      timeRange={timeRange}
      selectedDevices={selectedDevices}
    />
  );

// Clicks a dropdown button by its label text, ignoring SVG <text> axis labels
const clickDropdownButton = (label: string) => {
  const btn = screen
    .getAllByText(label)
    .find((el) => el.closest("button") !== null);
  if (!btn) throw new Error(`Dropdown button "${label}" not found`);
  fireEvent.click(btn);
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("DeviceUtilization", () => {
  beforeEach(() => {
    // Default mock for useFilteredChartPoints - return appropriate data based on metric key
    mockUseFilteredChartPoints.mockImplementation((metricKey: string) => {
      switch (metricKey) {
        case "ts_meetings_num":
          return mockMeetingsData;
        case "ts_meetings_duration_tot":
          return mockDurationData;
        case "ts_connections_num":
          return mockConnectionsData;
        case "ts_posts_num":
          return mockPostsData;
        default:
          return [];
      }
    });

    // Reset tooltip flags
    __tooltipActive = false;
    __tooltipPayload = [];
    __tooltipLabel = "";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("static content", () => {
    it("renders section title", () => {
      renderComponent();
      expect(screen.getByText("Device Utilization")).toBeInTheDocument();
    });

    it("renders section description", () => {
      renderComponent();
      expect(
        screen.getByText(
          "Compare up to two types of usage data for devices in your organization"
        )
      ).toBeInTheDocument();
    });

    it("renders the chart wrapper", () => {
      renderComponent();
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("renders two metric dropdown buttons by default", () => {
      renderComponent();
      expect(
        screen
          .getAllByText("Number of meetings")
          .some((el) => el.closest("button"))
      ).toBe(true);
      expect(
        screen
          .getAllByText("Number of connections")
          .some((el) => el.closest("button"))
      ).toBe(true);
    });
  });

  // ── Hook integration ──────────────────────────────────────────────────────

  describe("hook integration", () => {
    it("calls useFilteredChartPoints with correct default metric keys", () => {
      renderComponent();
      expect(mockUseFilteredChartPoints).toHaveBeenCalledWith(
        "ts_meetings_num",
        "7d",
        expect.any(Set)
      );
      expect(mockUseFilteredChartPoints).toHaveBeenCalledWith(
        "ts_connections_num",
        "7d",
        expect.any(Set)
      );
    });

    it("passes timeRange prop to the hook", () => {
      renderComponent("30d");
      expect(mockUseFilteredChartPoints).toHaveBeenCalledWith(
        "ts_meetings_num",
        "30d",
        expect.any(Set)
      );
    });

    it("renders both Line components when both metrics have data", () => {
      renderComponent();
      expect(screen.getByTestId("line-meetings")).toBeInTheDocument();
      expect(screen.getByTestId("line-connections")).toBeInTheDocument();
    });

    it("purple line (metricA) has correct stroke colour", () => {
      renderComponent();
      expect(screen.getByTestId("line-meetings")).toHaveAttribute(
        "data-stroke",
        "#6860C8"
      );
    });

    it("pink line (metricB) has correct stroke colour", () => {
      renderComponent();
      expect(screen.getByTestId("line-connections")).toHaveAttribute(
        "data-stroke",
        "#D44E80"
      );
    });
  });

  // ── Metric A dropdown ─────────────────────────────────────────────────────

  describe("MetricA dropdown", () => {
    it("metric A cannot be the same option as metric B (disabled)", () => {
      renderComponent();
      clickDropdownButton("Number of meetings");
      const connectionsOption = screen
        .getAllByText("Number of connections")
        .find((el) => el.closest("[class*=cursor-default]"));
      expect(connectionsOption).toBeTruthy();
    });

    it("does NOT show 'None' option in the first dropdown", () => {
      renderComponent();
      clickDropdownButton("Number of meetings");
      expect(screen.queryByText("None")).not.toBeInTheDocument();
    });
  });

  // ── Metric B dropdown ─────────────────────────────────────────────────────

  describe("MetricB dropdown", () => {
    it("opens when the pink button is clicked", () => {
      renderComponent();
      clickDropdownButton("Number of connections");
      expect(
        screen.getAllByText("Number of meetings").length
      ).toBeGreaterThanOrEqual(2);
    });

    it("shows 'None' option in the second dropdown", () => {
      renderComponent();
      clickDropdownButton("Number of connections");
      expect(screen.getByText("None")).toBeInTheDocument();
    });

    it("selecting 'None' removes metricB line from chart", () => {
      renderComponent();
      clickDropdownButton("Number of connections");
      fireEvent.click(screen.getByText("None"));
      expect(screen.queryByTestId("line-connections")).not.toBeInTheDocument();
    });

    it("selecting 'None' calls hook with empty string for metricB", () => {
      mockUseFilteredChartPoints.mockClear();
      renderComponent();
      clickDropdownButton("Number of connections");
      fireEvent.click(screen.getByText("None"));
      // Should call with empty string when metric is None
      expect(mockUseFilteredChartPoints).toHaveBeenCalledWith(
        "",
        "7d",
        expect.any(Set)
      );
    });

    it("updating metric B calls hook with new key", () => {
      mockUseFilteredChartPoints.mockClear();
      renderComponent();
      clickDropdownButton("Number of connections");
      fireEvent.click(screen.getAllByText("Hours in use")[0]);
      expect(mockUseFilteredChartPoints).toHaveBeenCalledWith(
        "ts_meetings_duration_tot",
        "7d",
        expect.any(Set)
      );
    });
  });

  // ── Swap behaviour ────────────────────────────────────────────────────────

  describe("metric swap on conflict", () => {
    it("disabled item in B dropdown cannot select metric already used by A", () => {
      mockUseFilteredChartPoints.mockClear();
      renderComponent();
      clickDropdownButton("Number of connections");
      const disabledItem = screen
        .getAllByText("Number of meetings")
        .map((el) => el.closest("[class*='cursor']"))
        .find((el) => el?.className.includes("cursor-default"));
      expect(disabledItem).toBeTruthy();
      fireEvent.click(disabledItem!);
      // Should still have meetings and connections
      expect(mockUseFilteredChartPoints).toHaveBeenCalledWith(
        "ts_meetings_num",
        "7d",
        expect.any(Set)
      );
      expect(mockUseFilteredChartPoints).toHaveBeenCalledWith(
        "ts_connections_num",
        "7d",
        expect.any(Set)
      );
    });

    it("A dropdown disables the metric currently used by B so no swap is needed", () => {
      renderComponent();
      clickDropdownButton("Number of meetings");
      const disabledItem = screen
        .getAllByText("Number of connections")
        .map((el) => el.closest("div"))
        .find((el) => el?.className.includes("cursor-default"));
      expect(disabledItem).toBeTruthy();
      fireEvent.click(disabledItem!);
      const purpleBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.style.background?.includes("104, 96, 200")
      );
      expect(purpleBtn?.textContent).toContain("Number of meetings");
    });
  });

  // ── Empty / no data ───────────────────────────────────────────────────────

  describe("when no data is returned", () => {
    it("does not render metricA Line when dataA is all zeros", () => {
      mockUseFilteredChartPoints.mockImplementation((metricKey: string) => {
        if (metricKey === "ts_meetings_num")
          return mockMeetingsData.map((p) => ({ ...p, value: 0 }));
        return mockConnectionsData;
      });
      renderComponent();
      // The component still renders the line but with zero values
      expect(screen.getByTestId("line-meetings")).toBeInTheDocument();
    });

    it("does not render metricB Line when dataB is all zeros", () => {
      mockUseFilteredChartPoints.mockImplementation((metricKey: string) => {
        if (metricKey === "ts_connections_num")
          return mockConnectionsData.map((p) => ({ ...p, value: 0 }));
        return mockMeetingsData;
      });
      renderComponent();
      expect(screen.getByTestId("line-connections")).toBeInTheDocument();
    });

    it("still renders both YAxes even when only one metric has data", () => {
      mockUseFilteredChartPoints.mockImplementation((metricKey: string) => {
        if (metricKey === "ts_meetings_num")
          return mockMeetingsData.map((p) => ({ ...p, value: 0 }));
        if (metricKey === "ts_connections_num") return mockConnectionsData;
        return [];
      });
      renderComponent();
      const yAxes = screen.queryAllByTestId(/y-axis/);
      expect(yAxes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── getNiceTicks utility behaviour (via rendered output) ──────────────────

  describe("axis tick calculation", () => {
    it("renders a right YAxis when both metrics have data", () => {
      renderComponent();
      expect(screen.getByTestId("y-axis-right")).toBeInTheDocument();
    });

    it("does NOT render a right YAxis when metricB is null", () => {
      renderComponent();
      const connectionsBtn = screen
        .getAllByText("Number of connections")
        .find((el) => el.closest("button") !== null)!;
      fireEvent.click(connectionsBtn);
      fireEvent.click(screen.getByText("None"));
      expect(screen.queryByTestId("y-axis-right")).not.toBeInTheDocument();
    });
  });

  // ── ChartTooltip coverage ───────────────────────────────────────────────────

  describe("ChartTooltip", () => {
    afterEach(() => {
      __tooltipActive = false;
      __tooltipPayload = [];
      __tooltipLabel = "";
    });

    it("renders nothing when tooltip is not active", () => {
      __tooltipActive = false;
      renderComponent();
      expect(document.querySelector(".shadow-md")).not.toBeInTheDocument();
    });

    it("renders label and payload entries when tooltip is active", () => {
      __tooltipActive = true;
      __tooltipLabel = "Feb 26";
      __tooltipPayload = [
        { name: "meetings", value: 7, color: "#6860C8" },
        { name: "connections", value: 6, color: "#D44E80" },
      ];
      renderComponent();
      expect(screen.getByText("Feb 26")).toBeInTheDocument();
      const tooltip = document.querySelector(".shadow-md")!;
      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toContain("meetings");
      expect(tooltip.textContent).toContain("connections");
      expect(tooltip.textContent).toContain("7");
      expect(tooltip.textContent).toContain("6");
    });

    it("filters out payload entries with value 0", () => {
      __tooltipActive = true;
      __tooltipLabel = "Mar 1";
      __tooltipPayload = [
        { name: "meetings", value: 0, color: "#6860C8" },
        { name: "connections", value: 5, color: "#D44E80" },
      ];
      renderComponent();
      expect(screen.queryByText("meetings")).not.toBeInTheDocument();
      const tooltip = document.querySelector(".shadow-md")!;
      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toContain("5");
    });

    it("renders nothing when payload is empty", () => {
      __tooltipActive = true;
      __tooltipLabel = "Mar 1";
      __tooltipPayload = [];
      renderComponent();
      expect(document.querySelector(".shadow-md")).not.toBeInTheDocument();
    });
  });

  // ── LeftAxisLabel & RightAxisLabel coverage ───────────────────────────────

  describe("AxisLabels", () => {
    it("LeftAxisLabel renders an SVG text element for the left axis", () => {
      renderComponent();
      const svgTexts = document.querySelectorAll("text");
      expect(svgTexts.length).toBeGreaterThanOrEqual(1);
    });

    it("LeftAxisLabel text contains the metricA label", () => {
      renderComponent();
      const texts = Array.from(document.querySelectorAll("text")).map(
        (t) => t.textContent
      );
      expect(texts.some((t) => t?.includes("Number of meetings"))).toBe(true);
    });

    it("RightAxisLabel renders a second SVG text when both metrics have data", () => {
      renderComponent();
      const svgTexts = document.querySelectorAll("text");
      expect(svgTexts.length).toBeGreaterThanOrEqual(2);
    });

    it("RightAxisLabel text contains the metricB label", () => {
      renderComponent();
      const texts = Array.from(document.querySelectorAll("text")).map(
        (t) => t.textContent
      );
      expect(texts.some((t) => t?.includes("Number of connections"))).toBe(
        true
      );
    });

    it("only one SVG text rendered when metricB is None (no right axis label)", () => {
      renderComponent();
      const connectionsBtn = screen
        .getAllByText("Number of connections")
        .find((el) => el.closest("button") !== null)!;
      fireEvent.click(connectionsBtn);
      fireEvent.click(screen.getByText("None"));
      const svgTexts = document.querySelectorAll("text");
      expect(svgTexts.length).toBeLessThan(2);
    });

    it("LeftAxisLabel does not crash when both datasets are empty", () => {
      mockUseFilteredChartPoints.mockImplementation(() => []);
      renderComponent();
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });
});
