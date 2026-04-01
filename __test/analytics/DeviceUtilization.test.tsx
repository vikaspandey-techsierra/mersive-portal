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
const mockUseDeviceUtilizationMetrics = jest.fn();

// ---------------------------------------------------------------------------
// Mock the useTimeSeriesMetrics hooks BEFORE importing the component
// ---------------------------------------------------------------------------
jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useDeviceUtilizationMetrics: (...args: any[]) =>
    mockUseDeviceUtilizationMetrics(...args),
}));

// ---------------------------------------------------------------------------
// Mock EmptyState
// ---------------------------------------------------------------------------
jest.mock("@/components/emptyStates/emptyStates", () => ({
  __esModule: true,
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock ChartTooltip - render actual tooltip content for testing
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Mock AxisLabel
// ---------------------------------------------------------------------------
jest.mock("@/components/charts/AxisLabel", () => ({
  LeftAxisLabel: ({ label, color }: { label: string; color: string }) => (
    <text data-testid="left-axis-label">{label}</text>
  ),
  RightAxisLabel: ({ label, color }: { label: string; color: string }) => (
    <text data-testid="right-axis-label">{label}</text>
  ),
}));

// ---------------------------------------------------------------------------
// Mock MetricDropdown
// ---------------------------------------------------------------------------
jest.mock("@/components/charts/MetricDropdown", () => ({
  MetricDropdown: ({
    value,
    options,
    color,
    disabledValue,
    showNone,
    onChange,
  }: any) => (
    <button
      data-testid={`dropdown-${value}`}
      style={{ background: color }}
      onClick={() => {
        if (showNone) {
          onChange(null);
        } else {
          const nextOption = options.find((o: any) => o.value !== value);
          if (nextOption) onChange(nextOption.value);
        }
      }}
    >
      {value ? value : "None"}
    </button>
  ),
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

// Define types for mock data
interface MockDataPoint {
  date: string;
  value: number;
}

// ---------------------------------------------------------------------------
// Mock recharts – renders a lightweight stub so we don't need a real canvas
// ---------------------------------------------------------------------------
// Tooltip payload injected by tests that need to exercise ChartTooltip
let __tooltipPayload: {
  dataKey: string;
  name: string;
  value: number;
  color: string;
  stroke: string;
}[] = [];
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
      // Render the tooltip content with the active state and payload
      if (!__tooltipActive) return <div />;
      const ContentFn = (content as React.ReactElement).type as React.FC<any>;
      return (
        <ContentFn
          active={__tooltipActive}
          label={__tooltipLabel}
          payload={__tooltipPayload}
          labelMap={{
            meetings: "Number of meetings",
            hours: "Hours in use",
            connections: "Number of connections",
            posts: "Number of posts",
            avgLength: "Avg. length of meetings",
          }}
          formatValue={(v: number, key: string) =>
            key === "hours"
              ? `${v % 1 === 0 ? v : v.toFixed(1)}hr`
              : v % 1 === 0
              ? String(v)
              : String(parseFloat(v.toFixed(2)))
          }
        />
      );
    },
  };
});

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------
jest.mock("@/lib/analytics/utils/helpers", () => ({
  formatShortDate: (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },
  getNiceTicks: (points: MockDataPoint[]) => {
    if (!points.length) return { ticks: [0, 1, 2, 3, 4], max: 4 };
    const max = Math.max(...points.map((p) => p.value));
    return { ticks: [0, max * 0.25, max * 0.5, max * 0.75, max], max };
  },
  getSevenTicks: (labels: string[]) => {
    if (labels.length === 0) return [];
    const step = Math.max(1, Math.floor(labels.length / 7));
    return labels.filter((_, i) => i % step === 0).slice(0, 7);
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const renderComponent = (
  orgId = "test-org-123",
  timeRange = "7d",
  selectedDevices = new Set<string>()
) =>
  render(
    <DeviceUtilization
      orgId={orgId}
      timeRange={timeRange}
      selectedDevices={selectedDevices}
    />
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("DeviceUtilization", () => {
  beforeEach(() => {
    // Default mock for useDeviceUtilizationMetrics
    mockUseDeviceUtilizationMetrics.mockImplementation(
      (
        orgId: string,
        metricA: string,
        metricB: string,
        timeRange: string,
        selectedDevices: Set<string>
      ) => {
        let dataA: MockDataPoint[] = [];
        let dataB: MockDataPoint[] = [];

        switch (metricA) {
          case "ts_meetings_num":
            dataA = mockMeetingsData;
            break;
          case "ts_meetings_duration_tot":
            dataA = mockDurationData;
            break;
          case "ts_connections_num":
            dataA = mockConnectionsData;
            break;
          case "ts_posts_num":
            dataA = mockPostsData;
            break;
          default:
            dataA = [];
        }

        switch (metricB) {
          case "ts_meetings_num":
            dataB = mockMeetingsData;
            break;
          case "ts_meetings_duration_tot":
            dataB = mockDurationData;
            break;
          case "ts_connections_num":
            dataB = mockConnectionsData;
            break;
          case "ts_posts_num":
            dataB = mockPostsData;
            break;
          default:
            dataB = [];
        }

        return { dataA, dataB };
      }
    );

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
      expect(screen.getByTestId("dropdown-meetings")).toBeInTheDocument();
      expect(screen.getByTestId("dropdown-connections")).toBeInTheDocument();
    });
  });

  // ── Hook integration ──────────────────────────────────────────────────────

  describe("hook integration", () => {
    it("calls useDeviceUtilizationMetrics with correct default metric keys", () => {
      renderComponent();
      expect(mockUseDeviceUtilizationMetrics).toHaveBeenCalledWith(
        "test-org-123",
        "ts_meetings_num",
        "ts_connections_num",
        "7d",
        expect.any(Set)
      );
    });

    it("passes timeRange prop to the hook", () => {
      renderComponent("test-org-123", "30d");
      expect(mockUseDeviceUtilizationMetrics).toHaveBeenCalledWith(
        "test-org-123",
        "ts_meetings_num",
        "ts_connections_num",
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
      expect(screen.getByTestId("dropdown-meetings")).toBeInTheDocument();
    });

    it("does NOT show 'None' option in the first dropdown", () => {
      renderComponent();
      expect(screen.queryByText("None")).not.toBeInTheDocument();
    });
  });

  // ── Metric B dropdown ─────────────────────────────────────────────────────

  describe("MetricB dropdown", () => {
    it("opens when the pink button is clicked", () => {
      renderComponent();
      expect(screen.getByTestId("dropdown-connections")).toBeInTheDocument();
    });

    it("selecting 'None' removes metricB line from chart", () => {
      renderComponent();
      expect(screen.getByTestId("line-connections")).toBeInTheDocument();
    });
  });

  // ── Empty / no data ───────────────────────────────────────────────────────

  describe("when no data is returned", () => {
    it("shows empty state when all values are zero", () => {
      mockUseDeviceUtilizationMetrics.mockImplementation(() => ({
        dataA: mockMeetingsData.map((p) => ({ ...p, value: 0 })),
        dataB: mockConnectionsData.map((p) => ({ ...p, value: 0 })),
      }));
      renderComponent();
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
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

    it("renders label and payload entries when tooltip is active", async () => {
      __tooltipActive = true;
      __tooltipLabel = "2/26";
      __tooltipPayload = [
        {
          dataKey: "meetings",
          name: "meetings",
          value: 7,
          color: "#6860C8",
          stroke: "#6860C8",
        },
        {
          dataKey: "connections",
          name: "connections",
          value: 6,
          color: "#D44E80",
          stroke: "#D44E80",
        },
      ];
      renderComponent();
      // Wait for the tooltip to render
      await waitFor(() => {
        expect(screen.getByText("2/26")).toBeInTheDocument();
      });
      const tooltip = document.querySelector(".shadow-md");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip?.textContent).toContain("Number of meetings");
      expect(tooltip?.textContent).toContain("Number of connections");
      expect(tooltip?.textContent).toContain("7");
      expect(tooltip?.textContent).toContain("6");
    });

    it("renders nothing when payload is empty", () => {
      __tooltipActive = true;
      __tooltipLabel = "3/1";
      __tooltipPayload = [];
      renderComponent();
      expect(document.querySelector(".shadow-md")).not.toBeInTheDocument();
    });
  });

  // ── AxisLabels coverage ───────────────────────────────────────────────────

  describe("AxisLabels", () => {
    it("LeftAxisLabel renders the metricA label", () => {
      renderComponent();
      expect(screen.getByTestId("left-axis-label")).toBeInTheDocument();
    });

    it("RightAxisLabel renders when both metrics have data", () => {
      renderComponent();
      expect(screen.getByTestId("right-axis-label")).toBeInTheDocument();
    });

    it("LeftAxisLabel does not crash when both datasets are empty", () => {
      mockUseDeviceUtilizationMetrics.mockImplementation(() => ({
        dataA: [],
        dataB: [],
      }));
      renderComponent();
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });
});
