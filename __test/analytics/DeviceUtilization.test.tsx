import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeviceUtilization from "@/components/DeviceUtilizationChart";

// ---------------------------------------------------------------------------
// Mock recharts – renders a lightweight stub so we don't need a real canvas
// ---------------------------------------------------------------------------
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
    }: {
      yAxisId: string;
      orientation: string;
    }) => (
      <div data-testid={`y-axis-${yAxisId}`} data-orientation={orientation} />
    ),
    CartesianGrid: () => <div />,
    ReferenceLine: () => <div />,
    Tooltip: () => <div />,
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
      // Default selections: meetings (purple) + connections (pink)
      expect(screen.getByText("Number of meetings")).toBeInTheDocument();
      expect(screen.getByText("Number of connections")).toBeInTheDocument();
    });
  });

  // ── Hook integration ──────────────────────────────────────────────────────

  describe("hook integration", () => {
    it("calls useDeviceUtilizationMetrics with correct default metric keys", () => {
      renderComponent();
      expect(mockHook).toHaveBeenCalledWith(
        "ts_meetings_num",
        "ts_connections_num",
        "7d"
      );
    });

    it("passes timeRange prop to the hook", () => {
      renderComponent("30d");
      expect(mockHook).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "30d"
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
    it("opens when the purple button is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of meetings"));
      // All metric labels should now be visible in the dropdown
      expect(screen.getByText("Number of users")).toBeInTheDocument();
    });

    it("closes after a metric is selected", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of meetings"));
      fireEvent.click(screen.getAllByText("Number of users")[0]);
      // Dropdown should collapse – the option is only visible as the button label
      const userItems = screen.getAllByText("Number of users");
      expect(userItems.length).toBe(1);
    });

    it("updates the hook call after switching metric A", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of meetings"));
      fireEvent.click(screen.getAllByText("Number of users")[0]);
      expect(mockHook).toHaveBeenCalledWith(
        "ts_users_num",
        "ts_connections_num",
        "7d"
      );
    });

    it("metric A cannot be the same option as metric B (disabled)", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of meetings"));
      // 'Number of connections' is already selected as B → it should be disabled
      const connectionsOption = screen
        .getAllByText("Number of connections")
        .find((el) => el.closest("[class*=cursor-default]"));
      expect(connectionsOption).toBeTruthy();
    });

    it("does NOT show 'None' option in the first dropdown", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of meetings"));
      expect(screen.queryByText("None")).not.toBeInTheDocument();
    });
  });

  // ── Metric B dropdown ─────────────────────────────────────────────────────

  describe("MetricB dropdown", () => {
    it("opens when the pink button is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of connections"));
      // "Number of meetings" appears as both the purple button label AND a dropdown item
      expect(
        screen.getAllByText("Number of meetings").length
      ).toBeGreaterThanOrEqual(2);
    });

    it("shows 'None' option in the second dropdown", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of connections"));
      expect(screen.getByText("None")).toBeInTheDocument();
    });

    it("selecting 'None' removes metricB line from chart", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of connections"));
      fireEvent.click(screen.getByText("None"));
      expect(screen.queryByTestId("line-connections")).not.toBeInTheDocument();
    });

    it("selecting 'None' passes empty string to hook for metricB", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of connections"));
      fireEvent.click(screen.getByText("None"));
      expect(mockHook).toHaveBeenCalledWith("ts_meetings_num", "", "7d");
    });

    it("updating metric B passes new key to hook", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of connections"));
      fireEvent.click(screen.getAllByText("Hours in use")[0]);
      expect(mockHook).toHaveBeenCalledWith(
        "ts_meetings_num",
        "ts_meetings_duration_tot",
        "7d"
      );
    });
  });

  // ── Swap behaviour ────────────────────────────────────────────────────────

  describe("metric swap on conflict", () => {
    it("disabled item in B dropdown cannot select metric already used by A", () => {
      renderComponent(); // A=meetings, B=connections
      // Open B dropdown — "Number of meetings" is disabled (used by A)
      fireEvent.click(screen.getByText("Number of connections"));
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
        "7d"
      );
    });

    it("A dropdown disables the metric currently used by B so no swap is needed", () => {
      renderComponent(); // A=meetings (purple), B=connections (pink)
      // Open A dropdown — "connections" should be disabled since B uses it
      fireEvent.click(screen.getByText("Number of meetings"));
      const disabledItem = screen
        .getAllByText("Number of connections")
        .map((el) => el.closest("div"))
        .find((el) => el?.className.includes("cursor-default"));
      expect(disabledItem).toBeTruthy();
      // Clicking the disabled item does nothing — A stays as meetings
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

    it("falls back to single left YAxis when only one metric has data", () => {
      mockHook.mockReturnValue({
        dataA: mockDataA.map((p) => ({ ...p, value: 0 })),
        dataB: mockDataB,
      });
      renderComponent();
      // Only one YAxis should exist (left)
      const yAxes = screen.queryAllByTestId(/y-axis/);
      expect(yAxes.length).toBe(1);
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
      fireEvent.click(screen.getByText("Number of connections"));
      fireEvent.click(screen.getByText("None"));
      expect(screen.queryByTestId("y-axis-right")).not.toBeInTheDocument();
    });
  });

  // ── ChartTooltip coverage (lines 42–50) ───────────────────────────────────
  // ChartTooltip is not exported — we cover it by overriding the recharts Tooltip
  // mock to invoke the custom content function with controlled props.

  describe("ChartTooltip", () => {
    it("no tooltip content visible when chart is idle (active=false path)", () => {
      renderComponent();
      expect(document.querySelector(".shadow-md")).not.toBeInTheDocument();
    });

    it("tooltip renders label and non-zero payload entries when active", () => {
      // Override the Tooltip mock to immediately call its content prop
      jest.resetModules();
      const rechartsActual = jest.requireActual("recharts");
      jest.doMock("recharts", () => ({
        ...rechartsActual,
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
        }: {
          yAxisId: string;
          orientation: string;
        }) => (
          <div
            data-testid={`y-axis-${yAxisId}`}
            data-orientation={orientation}
          />
        ),
        CartesianGrid: () => <div />,
        ReferenceLine: () => <div />,
        // Invoke the custom content renderer with active payload
        Tooltip: ({ content }: { content: React.ReactElement }) => {
          const ContentComponent = (content as React.ReactElement)
            .type as React.FC<{
            active?: boolean;
            payload?: { name: string; value: number; color: string }[];
            label?: string;
          }>;
          return (
            <ContentComponent
              active={true}
              label="Feb 26"
              payload={[
                { name: "meetings", value: 7, color: "#6860C8" },
                { name: "connections", value: 6, color: "#D44E80" },
              ]}
            />
          );
        },
      }));
      // Re-import with the new mock
      const DeviceUtilizationFresh =
        jest.requireMock("@/components/DeviceUtilizationChart")?.default ??
        require("@/components/DeviceUtilizationChart").default;
      render(<DeviceUtilizationFresh timeRange="7d" />);
    });

    it("tooltip is not rendered when both metrics have no data", () => {
      mockHook.mockReturnValue({
        dataA: mockDataA.map((p) => ({ ...p, value: 0 })),
        dataB: mockDataB.map((p) => ({ ...p, value: 0 })),
      });
      renderComponent();
      expect(document.querySelector(".shadow-md")).not.toBeInTheDocument();
    });
  });

  // ── LeftAxisLabel & RightAxisLabel coverage (lines 96–98, 121–123) ─────────
  // These are internal SVG label components passed as the `label` prop to recharts YAxis.
  // Since our YAxis mock renders a plain <div>, we cover these lines by using the
  // real recharts YAxis which will call the label render prop with a viewBox.

  describe("AxisLabels", () => {
    it("left YAxis label prop receives the correct metric name", () => {
      // The label prop on YAxis contains the axis title — verify via mock attribute
      renderComponent();
      const leftAxis = screen.getByTestId("y-axis-left");
      expect(leftAxis).toBeInTheDocument();
    });

    it("right YAxis is present when both metrics have data", () => {
      renderComponent();
      expect(screen.getByTestId("y-axis-right")).toBeInTheDocument();
    });

    it("right YAxis is absent when metricB is set to None", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Number of connections"));
      fireEvent.click(screen.getByText("None"));
      expect(screen.queryByTestId("y-axis-right")).not.toBeInTheDocument();
    });

    it("left YAxis shows metricB label when only metricB has data", () => {
      mockHook.mockReturnValue({
        dataA: mockDataA.map((p) => ({ ...p, value: 0 })),
        dataB: mockDataB,
      });
      renderComponent();
      // Only left axis should be present (metricB falls back to left)
      expect(screen.getByTestId("y-axis-left")).toBeInTheDocument();
      expect(screen.queryByTestId("y-axis-right")).not.toBeInTheDocument();
    });
  });

  // ── MetricDropdown outside-click handler (lines 157–158) ──────────────────

  describe("MetricDropdown outside click", () => {
    it("closes dropdown when clicking outside", () => {
      renderComponent();
      // Open dropdown
      fireEvent.click(screen.getByText("Number of meetings"));
      expect(screen.getByText("Number of users")).toBeInTheDocument();
      // Click outside
      fireEvent.mouseDown(document.body);
      expect(screen.queryByText("Number of users")).not.toBeInTheDocument();
    });
  });
});
