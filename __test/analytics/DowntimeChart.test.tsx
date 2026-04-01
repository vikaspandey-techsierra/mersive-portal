import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DowntimeChart from "@/components/DowntimeChart";

const mockUseDowntimeChart = jest.fn();

jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useDowntimeChart: (...args: any[]) => mockUseDowntimeChart(...args),
}));

jest.mock("@/components/emptyStates/emptyStates", () => ({
  __esModule: true,
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

jest.mock("@/components/charts/ChartsTooltip", () => ({
  ChartTooltip: ({ active, payload, label, labelMap, formatValue }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
        <div className="font-semibold mb-1 text-black">{label}</div>
        {payload.map((p: any) => {
          const displayLabel =
            (labelMap && labelMap[p.dataKey]) || p.name || p.dataKey;
          const displayValue = formatValue
            ? formatValue(p.value, p.dataKey)
            : String(p.value);
          return (
            <div key={p.dataKey} style={{ color: p.color || p.stroke }}>
              {displayLabel}: {displayValue}
            </div>
          );
        })}
      </div>
    );
  },
}));

jest.mock("@/components/charts/AxisLabel", () => ({
  LeftAxisLabel: ({ label, color }: { label: string; color: string }) => (
    <text data-testid="left-axis-label">{label}</text>
  ),
  RightAxisLabel: ({ label, color }: { label: string; color: string }) => (
    <text data-testid="right-axis-label">{label}</text>
  ),
}));

const DOWNTIME_DATA = [
  { date: "2026-02-26", devices: 9, hours: 1.45 },
  { date: "2026-02-27", devices: 13, hours: 1.65 },
  { date: "2026-02-28", devices: 3, hours: 1.15 },
  { date: "2026-03-01", devices: 11, hours: 1.55 },
  { date: "2026-03-02", devices: 19, hours: 1.95 },
  { date: "2026-03-03", devices: 0, hours: 1.0 },
  { date: "2026-03-04", devices: 0, hours: 1.0 },
];

let __tooltipActive = false;
let __tooltipLabel = "";
let __tooltipPayload: { dataKey: string; value: number; stroke: string }[] = [];

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
    XAxis: () => <div data-testid="x-axis" />,
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
    Tooltip: ({ content }: { content?: React.ReactElement }) => {
      if (!__tooltipActive) return <div />;
      const ContentFn = (content as React.ReactElement).type as React.FC<any>;
      return (
        <ContentFn
          active={__tooltipActive}
          label={__tooltipLabel}
          payload={__tooltipPayload}
          labelMap={{
            devices: "Devices",
            hours: "Hours",
          }}
          formatValue={(v: number, key: string) =>
            key === "hours" ? `${Number(v).toFixed(1)} hr` : String(v)
          }
        />
      );
    },
  };
});

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

const renderChart = (
  orgId = "test-org-123",
  timeRange = "7d",
  selectedDevices = new Set<string>()
) =>
  render(
    <DowntimeChart
      orgId={orgId}
      timeRange={timeRange}
      selectedDevices={selectedDevices}
    />
  );

describe("DowntimeChart", () => {
  beforeEach(() => {
    mockUseDowntimeChart.mockReturnValue({ data: DOWNTIME_DATA });
    __tooltipActive = false;
    __tooltipPayload = [];
    __tooltipLabel = "";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Heading & description ─────────────────────────────────────────────────
  describe("heading and description", () => {
    it("renders the Downtime heading", () => {
      renderChart();
      expect(screen.getByText("Downtime")).toBeInTheDocument();
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
    it("LeftAxisLabel renders with 'Number of devices'", () => {
      renderChart();
      expect(screen.getByTestId("left-axis-label")).toBeInTheDocument();
      expect(screen.getByTestId("left-axis-label").textContent).toBe(
        "Number of devices"
      );
    });

    it("RightAxisLabel renders with 'Number of hours'", () => {
      renderChart();
      expect(screen.getByTestId("right-axis-label")).toBeInTheDocument();
      expect(screen.getByTestId("right-axis-label").textContent).toBe(
        "Number of hours"
      );
    });

    it("both axis labels are present", () => {
      renderChart();
      expect(screen.getByTestId("left-axis-label")).toBeInTheDocument();
      expect(screen.getByTestId("right-axis-label")).toBeInTheDocument();
    });

    it("shows empty state when data is empty", () => {
      mockUseDowntimeChart.mockReturnValue({ data: [] });
      renderChart();
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  // ── CustomTooltip ─────────────────────────────────────────────────────────
  describe("CustomTooltip", () => {
    afterEach(() => {
      __tooltipActive = false;
      __tooltipPayload = [];
      __tooltipLabel = "";
    });

    it("renders nothing when tooltip is not active", () => {
      __tooltipActive = false;
      renderChart();
      expect(document.querySelector(".shadow-md")).not.toBeInTheDocument();
    });

    it("renders the date label when active", () => {
      __tooltipActive = true;
      __tooltipLabel = "2/26";
      __tooltipPayload = [{ dataKey: "devices", value: 9, stroke: "#5E54C5" }];
      renderChart();
      expect(screen.getByText("2/26")).toBeInTheDocument();
    });

    it("renders 'Devices: N' for devices payload entry", () => {
      __tooltipActive = true;
      __tooltipLabel = "2/26";
      __tooltipPayload = [{ dataKey: "devices", value: 9, stroke: "#5E54C5" }];
      renderChart();
      expect(screen.getByText(/Devices: 9/)).toBeInTheDocument();
    });

    it("renders 'Hours: N hr' for hours payload entry with 1 decimal place", () => {
      __tooltipActive = true;
      __tooltipLabel = "2/27";
      __tooltipPayload = [{ dataKey: "hours", value: 1.45, stroke: "#C55483" }];
      renderChart();
      // Hours are formatted to 1 decimal place, so 1.45 becomes 1.4
      expect(screen.getByText(/Hours: 1\.4 hr/)).toBeInTheDocument();
    });

    it("renders both entries when both are in the payload", () => {
      __tooltipActive = true;
      __tooltipLabel = "2/27";
      __tooltipPayload = [
        { dataKey: "devices", value: 13, stroke: "#5E54C5" },
        { dataKey: "hours", value: 1.65, stroke: "#C55483" },
      ];
      renderChart();
      expect(screen.getByText(/Devices: 13/)).toBeInTheDocument();
      // Hours are formatted to 1 decimal place, so 1.65 becomes 1.6
      expect(screen.getByText(/Hours: 1\.6 hr/)).toBeInTheDocument();
    });

    it("returns null (no content) when payload is empty", () => {
      __tooltipActive = true;
      __tooltipLabel = "2/26";
      __tooltipPayload = [];
      renderChart();
      expect(screen.queryByText("2/26")).not.toBeInTheDocument();
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────
  describe("edge cases", () => {
    it("renders without crashing when data is empty", () => {
      mockUseDowntimeChart.mockReturnValue({ data: [] });
      expect(() => renderChart()).not.toThrow();
    });

    it("renders correctly with a single data point", () => {
      mockUseDowntimeChart.mockReturnValue({
        data: [{ date: "2026-02-26", devices: 5, hours: 1.2 }],
      });
      renderChart();
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "1"
      );
    });

    it("shows empty state when all device values are zero", () => {
      const zeroData = DOWNTIME_DATA.map((d) => ({
        ...d,
        devices: 0,
        hours: 0,
      }));
      mockUseDowntimeChart.mockReturnValue({ data: zeroData });
      renderChart();
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("handles 30-day data length correctly", () => {
      const data30 = Array.from({ length: 30 }, (_, i) => ({
        date: `2026-02-${String(i + 1).padStart(2, "0")}`,
        devices: i % 20,
        hours: 1.0 + (i % 10) * 0.1,
      }));
      mockUseDowntimeChart.mockReturnValue({ data: data30 });
      renderChart();
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "30"
      );
    });
  });
});
