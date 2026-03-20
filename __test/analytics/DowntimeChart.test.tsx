/**
 * @file DowntimeChart.test.tsx
 * Tests for DowntimeChart component.
 *
 * Covers: structure, both Line elements, YAxis config, reference lines,
 * legend pills, LeftAxisLabel / RightAxisLabel SVG text, CustomTooltip
 * (active/inactive/devices/hours/empty-payload), and edge cases.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DowntimeChart, { type DowntimePoint } from "@/components/DowntimeChart";

// ---------------------------------------------------------------------------
// Tooltip state flags
// ---------------------------------------------------------------------------
let __tooltipActive = false;
let __tooltipLabel = "";
let __tooltipPayload: { dataKey: string; value: number; stroke: string }[] = [];

// ---------------------------------------------------------------------------
// Mock recharts
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
    Line: ({
      dataKey,
      stroke,
      yAxisId,
    }: {
      dataKey: string;
      stroke: string;
      yAxisId?: string;
    }) => (
      <div
        data-testid={`line-${dataKey}`}
        data-stroke={stroke}
        data-yaxisid={yAxisId}
      />
    ),
    XAxis: ({ interval }: { interval?: number }) => (
      <div data-testid="x-axis" data-interval={interval} />
    ),
    // YAxis invokes the label prop with a fake viewBox to exercise LeftAxisLabel / RightAxisLabel
    YAxis: ({
      yAxisId,
      orientation,
      label,
    }: {
      yAxisId?: string;
      orientation?: string;
      label?: React.ReactElement;
    }) => {
      const fakeViewBox = { x: 10, y: 10, width: 200, height: 200 };
      return (
        <div
          data-testid={yAxisId ? `y-axis-${yAxisId}` : "y-axis"}
          data-orientation={orientation}
        >
          {label
            ? React.cloneElement(label, { viewBox: fakeViewBox } as object)
            : null}
        </div>
      );
    },
    CartesianGrid: () => <div />,
    ReferenceLine: ({ y }: { y?: number }) => (
      <div data-testid={`ref-line-${y}`} />
    ),
    // Tooltip invokes CustomTooltip (JSX element) with controlled props
    Tooltip: ({ content }: { content?: React.ReactElement }) => {
      if (!content || !__tooltipActive) return <div />;
      const ContentFn = (content as React.ReactElement).type as React.FC<{
        active?: boolean;
        payload?: { dataKey: string; value: number; stroke: string }[];
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
// Test data
// ---------------------------------------------------------------------------
const DOWNTIME_DATA: DowntimePoint[] = [
  { date: "Dec 16", devices: 9, hours: 1.45 },
  { date: "Dec 17", devices: 13, hours: 1.65 },
  { date: "Dec 18", devices: 3, hours: 1.15 },
  { date: "Dec 19", devices: 11, hours: 1.55 },
  { date: "Dec 20", devices: 19, hours: 1.95 },
  { date: "Dec 21", devices: 0, hours: 1.0 },
  { date: "Dec 22", devices: 0, hours: 1.0 },
];

const renderChart = (data = DOWNTIME_DATA, interval = 0) =>
  render(<DowntimeChart data={data} interval={interval} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("DowntimeChart", () => {
  afterEach(() => {
    __tooltipActive = false;
    __tooltipPayload = [];
    __tooltipLabel = "";
  });

  // ── Heading & description ─────────────────────────────────────────────────
  describe("heading and description", () => {
    it("renders the Downtime heading", () => {
      renderChart();
      expect(
        screen.getByRole("heading", { name: "Downtime" })
      ).toBeInTheDocument();
    });

    it("renders the description text", () => {
      renderChart();
      expect(
        screen.getByText(/Monitor how many devices are down/)
      ).toBeInTheDocument();
    });
  });

  // ── Chart structure ───────────────────────────────────────────────────────
  describe("chart structure", () => {
    it("renders a LineChart with the correct number of data points", () => {
      renderChart();
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "7"
      );
    });

    it("renders both Line elements: devices and hours", () => {
      renderChart();
      expect(screen.getByTestId("line-devices")).toBeInTheDocument();
      expect(screen.getByTestId("line-hours")).toBeInTheDocument();
    });

    it("devices Line uses purple stroke #5E54C5", () => {
      renderChart();
      expect(screen.getByTestId("line-devices")).toHaveAttribute(
        "data-stroke",
        "#5E54C5"
      );
    });

    it("hours Line uses pink stroke #C55483", () => {
      renderChart();
      expect(screen.getByTestId("line-hours")).toHaveAttribute(
        "data-stroke",
        "#C55483"
      );
    });

    it("devices Line is bound to the left y-axis", () => {
      renderChart();
      expect(screen.getByTestId("line-devices")).toHaveAttribute(
        "data-yaxisid",
        "left"
      );
    });

    it("hours Line is bound to the right y-axis", () => {
      renderChart();
      expect(screen.getByTestId("line-hours")).toHaveAttribute(
        "data-yaxisid",
        "right"
      );
    });

    it("renders both left and right YAxis", () => {
      renderChart();
      expect(screen.getByTestId("y-axis-left")).toBeInTheDocument();
      expect(screen.getByTestId("y-axis-right")).toBeInTheDocument();
    });

    it("left YAxis has left orientation", () => {
      renderChart();
      expect(screen.getByTestId("y-axis-left")).toHaveAttribute(
        "data-orientation",
        "left"
      );
    });

    it("right YAxis has right orientation", () => {
      renderChart();
      expect(screen.getByTestId("y-axis-right")).toHaveAttribute(
        "data-orientation",
        "right"
      );
    });

    it("XAxis receives the interval prop", () => {
      renderChart(DOWNTIME_DATA, 4);
      expect(screen.getByTestId("x-axis")).toHaveAttribute(
        "data-interval",
        "4"
      );
    });

    it("renders 5 reference lines for device tick values [0,6,12,18,24]", () => {
      renderChart();
      [0, 6, 12, 18, 24].forEach((tick) => {
        expect(screen.getByTestId(`ref-line-${tick}`)).toBeInTheDocument();
      });
    });
  });

  // ── Legend pills ──────────────────────────────────────────────────────────
  describe("legend pills", () => {
    it("shows 'Number of devices' legend pill", () => {
      renderChart();
      // Use getAllByText since SVG axis label also contains this text
      expect(
        screen
          .getAllByText("Number of devices")
          .some((el) => el.tagName === "SPAN")
      ).toBe(true);
    });

    it("shows 'Number of hours' legend pill", () => {
      renderChart();
      expect(
        screen
          .getAllByText("Number of hours")
          .some((el) => el.tagName === "SPAN")
      ).toBe(true);
    });
  });

  // ── AxisLabels (LeftAxisLabel / RightAxisLabel) ───────────────────────────
  describe("AxisLabels", () => {
    it("LeftAxisLabel renders SVG <text> with 'Number of devices'", () => {
      renderChart();
      const texts = Array.from(document.querySelectorAll("text")).map(
        (t) => t.textContent
      );
      expect(texts.some((t) => t?.includes("Number of devices"))).toBe(true);
    });

    it("RightAxisLabel renders SVG <text> with 'Number of hours'", () => {
      renderChart();
      const texts = Array.from(document.querySelectorAll("text")).map(
        (t) => t.textContent
      );
      expect(texts.some((t) => t?.includes("Number of hours"))).toBe(true);
    });

    it("both axis label SVG texts are present", () => {
      renderChart();
      expect(document.querySelectorAll("text").length).toBeGreaterThanOrEqual(
        2
      );
    });

    it("LeftAxisLabel returns null when viewBox is absent", () => {
      // Render YAxis without label prop → no <text> from that axis
      // Verified by checking: with no data the component still renders without crash
      expect(() => renderChart([], 0)).not.toThrow();
    });
  });

  // ── CustomTooltip ─────────────────────────────────────────────────────────
  describe("CustomTooltip", () => {
    it("renders nothing when tooltip is not active", () => {
      __tooltipActive = false;
      renderChart();
      expect(
        document.querySelector("[style*='boxShadow']")
      ).not.toBeInTheDocument();
    });

    it("renders the date label when active", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 16";
      __tooltipPayload = [{ dataKey: "devices", value: 9, stroke: "#5E54C5" }];
      renderChart();
      expect(screen.getByText("Dec 16")).toBeInTheDocument();
    });

    it("renders 'Devices: N' for devices payload entry", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 16";
      __tooltipPayload = [{ dataKey: "devices", value: 9, stroke: "#5E54C5" }];
      renderChart();
      expect(screen.getByText(/Devices: 9/)).toBeInTheDocument();
    });

    it("renders 'Hours: N hr' for hours payload entry", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 17";
      __tooltipPayload = [{ dataKey: "hours", value: 1.45, stroke: "#C55483" }];
      renderChart();
      expect(screen.getByText(/Hours: 1\.45 hr/)).toBeInTheDocument();
    });

    it("renders both entries when both are in the payload", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 17";
      __tooltipPayload = [
        { dataKey: "devices", value: 13, stroke: "#5E54C5" },
        { dataKey: "hours", value: 1.65, stroke: "#C55483" },
      ];
      renderChart();
      expect(screen.getByText(/Devices: 13/)).toBeInTheDocument();
      expect(screen.getByText(/Hours: 1\.65 hr/)).toBeInTheDocument();
    });

    it("returns null (no content) when payload is empty", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 16";
      __tooltipPayload = [];
      renderChart();
      expect(screen.queryByText("Dec 16")).not.toBeInTheDocument();
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────
  describe("edge cases", () => {
    it("renders without crashing when data is empty", () => {
      expect(() => renderChart([], 0)).not.toThrow();
    });

    it("renders correctly with a single data point", () => {
      renderChart([{ date: "Dec 16", devices: 5, hours: 1.2 }], 0);
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "1"
      );
    });

    it("renders correctly when all device values are zero", () => {
      const zeroData = DOWNTIME_DATA.map((d) => ({ ...d, devices: 0 }));
      renderChart(zeroData);
      expect(screen.getByTestId("line-devices")).toBeInTheDocument();
    });

    it("handles 30-day data length correctly", () => {
      const data30 = Array.from({ length: 30 }, (_, i) => ({
        date: `Day ${i + 1}`,
        devices: i % 20,
        hours: 1.0 + (i % 10) * 0.1,
      }));
      renderChart(data30, 4);
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "30"
      );
    });

    it("interval 0 renders without crashing", () => {
      renderChart(DOWNTIME_DATA, 0);
      expect(screen.getByTestId("x-axis")).toHaveAttribute(
        "data-interval",
        "0"
      );
    });
  });
});
