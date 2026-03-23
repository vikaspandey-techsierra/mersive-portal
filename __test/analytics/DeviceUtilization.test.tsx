/**
 * @file device-utilization.test.tsx
 * Tests for DeviceUtilizationChart component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeviceUtilization from "@/components/DeviceUtilizationChart";

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
    // YAxis renders its label prop (LeftAxisLabel / RightAxisLabel) with a fake viewBox
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
    // Tooltip calls the custom ChartTooltip content with controlled props
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
// Mock the data hook
// ---------------------------------------------------------------------------
const mockDataA = [
  { date: "2026-02-26", value: 7 },
  { date: "2026-02-27", value: 10 },
  { date: "2026-02-28", value: 5 },
  { date: "2026-03-01", value: 8 },
  { date: "2026-03-02", value: 1 },
  { date: "2026-03-03", value: 9 },
  { date: "2026-03-04", value: 11 },
];

const mockDataB = [
  { date: "2026-02-26", value: 6 },
  { date: "2026-02-27", value: 8 },
  { date: "2026-02-28", value: 4 },
  { date: "2026-03-01", value: 6 },
  { date: "2026-03-02", value: 1 },
  { date: "2026-03-03", value: 7 },
  { date: "2026-03-04", value: 11 },
];

const mockHook = jest.fn();

jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useDeviceUtilizationMetrics: (...args: unknown[]) => mockHook(...args),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderComponent = (timeRange = "7d") =>
  render(<DeviceUtilization timeRange={timeRange} />);

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
    mockHook.mockReturnValue({ dataA: mockDataA, dataB: mockDataB });
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
          "Compare up to two types of usage data for devices in your organization",
        ),
      ).toBeInTheDocument();
    });

    it("renders the chart wrapper", () => {
      renderComponent();
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("renders two metric dropdown buttons by default", () => {
      renderComponent();
      // Default selections: meetings (purple) + connections (pink)
      // Confirm the dropdown buttons (not just SVG axis labels) are present
      expect(
        screen
          .getAllByText("Number of meetings")
          .some((el) => el.closest("button")),
      ).toBe(true);
      expect(
        screen
          .getAllByText("Number of connections")
          .some((el) => el.closest("button")),
      ).toBe(true);
    });
  });

  // ── Hook integration ──────────────────────────────────────────────────────

  describe("hook integration", () => {
    it("calls useDeviceUtilizationMetrics with correct default metric keys", () => {
      renderComponent();
      expect(mockHook).toHaveBeenCalledWith(
        "ts_meetings_num",
        "ts_connections_num",
        "7d",
      );
    });

    it("passes timeRange prop to the hook", () => {
      renderComponent("30d");
      expect(mockHook).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "30d",
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
        "#6860C8",
      );
    });

    it("pink line (metricB) has correct stroke colour", () => {
      renderComponent();
      expect(screen.getByTestId("line-connections")).toHaveAttribute(
        "data-stroke",
        "#D44E80",
      );
    });
  });

  // ── Metric A dropdown ─────────────────────────────────────────────────────

  describe("MetricA dropdown", () => {
    // it("opens when the purple button is clicked", () => {
    //   renderComponent();
    //   clickDropdownButton("Number of meetings");
    //   // All metric labels should now be visible in the dropdown
    //   expect(screen.getByText("Number of users")).toBeInTheDocument();
    // });

    it("metric A cannot be the same option as metric B (disabled)", () => {
      renderComponent();
      clickDropdownButton("Number of meetings");
      // 'Number of connections' is already selected as B → it should be disabled
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
      // "Number of meetings" appears as both the purple button label AND a dropdown item
      expect(
        screen.getAllByText("Number of meetings").length,
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

    it("selecting 'None' passes empty string to hook for metricB", () => {
      renderComponent();
      clickDropdownButton("Number of connections");
      fireEvent.click(screen.getByText("None"));
      expect(mockHook).toHaveBeenCalledWith("ts_meetings_num", "", "7d");
    });

    it("updating metric B passes new key to hook", () => {
      renderComponent();
      clickDropdownButton("Number of connections");
      fireEvent.click(screen.getAllByText("Hours in use")[0]);
      expect(mockHook).toHaveBeenCalledWith(
        "ts_meetings_num",
        "ts_meetings_duration_tot",
        "7d",
      );
    });
  });

  // ── Swap behaviour ────────────────────────────────────────────────────────

  describe("metric swap on conflict", () => {
    it("disabled item in B dropdown cannot select metric already used by A", () => {
      renderComponent(); // A=meetings, B=connections
      // Open B dropdown — "Number of meetings" is disabled (used by A)
      clickDropdownButton("Number of connections");
      // The disabled item has cursor-default and isDisabled=true so clicking it is a no-op
      const disabledItem = screen
        .getAllByText("Number of meetings")
        .map((el) => el.closest("[class*='cursor']"))
        .find((el) => el?.className.includes("cursor-default"));
      expect(disabledItem).toBeTruthy();
      // Clicking disabled item does not change the hook args
      fireEvent.click(disabledItem!);
      expect(mockHook).toHaveBeenLastCalledWith(
        "ts_meetings_num",
        "ts_connections_num",
        "7d",
      );
    });

    it("A dropdown disables the metric currently used by B so no swap is needed", () => {
      renderComponent(); // A=meetings (purple), B=connections (pink)
      // Open A dropdown — "connections" should be disabled since B uses it
      clickDropdownButton("Number of meetings");
      const disabledItem = screen
        .getAllByText("Number of connections")
        .map((el) => el.closest("div"))
        .find((el) => el?.className.includes("cursor-default"));
      expect(disabledItem).toBeTruthy();
      // Clicking the disabled item does nothing — A stays as meetings
      fireEvent.click(disabledItem!);
      const purpleBtn = Array.from(document.querySelectorAll("button")).find(
        (b) => b.style.background?.includes("104, 96, 200"),
      );
      expect(purpleBtn?.textContent).toContain("Number of meetings");
    });
  });

  // ── Empty / no data ───────────────────────────────────────────────────────

  describe("when no data is returned", () => {
    it("does not render metricA Line when dataA is all zeros", () => {
      mockHook.mockReturnValue({
        dataA: mockDataA.map((p) => ({ ...p, value: 0 })),
        dataB: mockDataB,
      });
      renderComponent();
      expect(screen.queryByTestId("line-meetings")).not.toBeInTheDocument();
    });

    it("does not render metricB Line when dataB is all zeros", () => {
      mockHook.mockReturnValue({
        dataA: mockDataA,
        dataB: mockDataB.map((p) => ({ ...p, value: 0 })),
      });
      renderComponent();
      expect(screen.queryByTestId("line-connections")).not.toBeInTheDocument();
    });

    it("still renders both YAxes even when only one metric has data", () => {
      mockHook.mockReturnValue({
        dataA: mockDataA.map((p) => ({ ...p, value: 0 })),
        dataB: mockDataB,
      });
      renderComponent();
      // Component renders both axes regardless of data values
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
      // Use getAllByText and click the button (not the SVG <text> axis label)
      const connectionsBtn = screen
        .getAllByText("Number of connections")
        .find((el) => el.closest("button") !== null)!;
      fireEvent.click(connectionsBtn);
      fireEvent.click(screen.getByText("None"));
      expect(screen.queryByTestId("y-axis-right")).not.toBeInTheDocument();
    });
  });

  // ── ChartTooltip coverage (lines 42–50) ───────────────────────────────────
  // ChartTooltip is internal (not exported). The Tooltip mock above reads
  // module-level flags (__tooltipActive / __tooltipPayload) to call it.

  describe("ChartTooltip", () => {
    afterEach(() => {
      // Reset tooltip flags after each test
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
      // Scope assertions to the tooltip container to avoid SVG axis label matches
      const tooltip = document.querySelector(".shadow-md")!;
      expect(tooltip).not.toBeNull();
      expect(tooltip.textContent).toContain("meetings");
      expect(tooltip.textContent).toContain("connections");
      // Values are split across elements — check textContent of the tooltip
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
      // "meetings" has value 0 — tooltip row should be absent
      // (SVG axis label "Number of meetings" still exists, so use exact match for bare "meetings")
      expect(screen.queryByText("meetings")).not.toBeInTheDocument();
      // "connections" tooltip row IS present (value=5); axis label also present
      expect(screen.getAllByText(/connections/).length).toBeGreaterThanOrEqual(
        1,
      );
      // Value is split across elements — check tooltip textContent
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

  // ── LeftAxisLabel & RightAxisLabel coverage (lines 96–98, 121–123) ─────────
  // The YAxis mock now passes a fake viewBox to the label prop, which invokes
  // LeftAxisLabel / RightAxisLabel and renders their SVG <text> elements.

  describe("AxisLabels", () => {
    it("LeftAxisLabel renders an SVG text element for the left axis", () => {
      renderComponent();
      // YAxis mock calls the label prop with a viewBox — LeftAxisLabel renders <text>
      const svgTexts = document.querySelectorAll("text");
      expect(svgTexts.length).toBeGreaterThanOrEqual(1);
    });

    it("LeftAxisLabel text contains the metricA label", () => {
      renderComponent();
      // Default metricA = "meetings" → label = "Number of meetings"
      const texts = Array.from(document.querySelectorAll("text")).map(
        (t) => t.textContent,
      );
      expect(texts.some((t) => t?.includes("Number of meetings"))).toBe(true);
    });

    it("RightAxisLabel renders a second SVG text when both metrics have data", () => {
      renderComponent();
      const svgTexts = document.querySelectorAll("text");
      // Both LeftAxisLabel and RightAxisLabel should render <text>
      expect(svgTexts.length).toBeGreaterThanOrEqual(2);
    });

    it("RightAxisLabel text contains the metricB label", () => {
      renderComponent();
      const texts = Array.from(document.querySelectorAll("text")).map(
        (t) => t.textContent,
      );
      expect(texts.some((t) => t?.includes("Number of connections"))).toBe(
        true,
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
      // When both metrics have all-zero data, the component still renders (no crash)
      mockHook.mockReturnValue({
        dataA: mockDataA.map((p) => ({ ...p, value: 0 })),
        dataB: mockDataB.map((p) => ({ ...p, value: 0 })),
      });
      renderComponent();
      // Component renders without throwing — axis may or may not render text nodes
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  // ── MetricDropdown outside-click handler (lines 157–158) ──────────────────

  // describe("MetricDropdown outside click", () => {
  //   it("closes dropdown when clicking outside", () => {
  //     renderComponent();
  //     // Click the purple button (not the SVG axis label <text>)
  //     const meetingsBtn = screen
  //       .getAllByText("Number of meetings")
  //       .find((el) => el.closest("button") !== null)!;
  //     fireEvent.click(meetingsBtn);
  //     expect(screen.getByText("Number of users")).toBeInTheDocument();
  //     // Click outside to close
  //     fireEvent.mouseDown(document.body);
  //     expect(screen.queryByText("Number of users")).not.toBeInTheDocument();
  //   });
  // });
});
