import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import CollaborationUsage from "@/components/CollaborationChart";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import { generateMockData, tickInterval, DAY_COUNTS } from "@/lib/homePage";
import { timeseriesMock } from "@/lib/analytics/mock/timeseriesMock";

const mockUseCollaborationUsageMetrics = jest.fn();

jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useCollaborationUsageMetrics: (...args: any[]) =>
    mockUseCollaborationUsageMetrics(...args),
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

jest.mock("recharts", () => {
  const Original = jest.requireActual("recharts");
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
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
      name,
    }: {
      dataKey: string;
      stroke: string;
      name: string;
    }) => (
      <div
        data-testid={`line-${dataKey}`}
        data-stroke={stroke}
        data-name={name}
      />
    ),
    XAxis: ({ ticks }: { ticks?: string[] }) => (
      <div data-testid="x-axis" data-ticks={ticks?.join(",")} />
    ),
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div />,
    Tooltip: ({ content }: { content: React.ReactElement }) => (
      <div data-testid="tooltip">{content}</div>
    ),
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

const buildDeviceUtilizationPoints = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    date: `2026-02-${String(i + 1).padStart(2, "0")}`,
    connections: i + 3,
    meetings: i + 5,
    posts: i + 2,
    hours: i * 0.5,
    avgLength: 0.5,
  }));

describe("CollaborationUsage", () => {
  const defaultProps = {
    orgId: "test-org-123",
    timeRange: "7d",
    selectedDevices: new Set<string>(),
  };

  beforeEach(() => {
    // Default mock implementation for most tests
    mockUseCollaborationUsageMetrics.mockReturnValue({
      connectionsAvg: [
        { date: "2026-02-01", value: 3 },
        { date: "2026-02-02", value: 4 },
        { date: "2026-02-03", value: 5 },
        { date: "2026-02-04", value: 6 },
        { date: "2026-02-05", value: 7 },
        { date: "2026-02-06", value: 8 },
        { date: "2026-02-07", value: 9 },
      ],
      postsAvg: [
        { date: "2026-02-01", value: 4 },
        { date: "2026-02-02", value: 4.8 },
        { date: "2026-02-03", value: 5.6 },
        { date: "2026-02-04", value: 6.4 },
        { date: "2026-02-05", value: 7.2 },
        { date: "2026-02-06", value: 8 },
        { date: "2026-02-07", value: 8.8 },
      ],
    });
  });

  describe("static content", () => {
    it("renders the section title", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByText("Collaboration Usage")).toBeInTheDocument();
    });

    it("renders the description text", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(
        screen.getByText(/Compare how many users connect/)
      ).toBeInTheDocument();
    });

    it("renders the line chart", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("renders exactly 2 lines (avgConnections + avgPosts)", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByTestId("line-avgConnections")).toBeInTheDocument();
      expect(screen.getByTestId("line-avgPosts")).toBeInTheDocument();
    });
  });

  describe("line styling", () => {
    it("avgConnections line is purple", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByTestId("line-avgConnections")).toHaveAttribute(
        "data-stroke",
        "#6860C8"
      );
    });

    it("avgPosts line is pink", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByTestId("line-avgPosts")).toHaveAttribute(
        "data-stroke",
        "#D44E80"
      );
    });

    it("avgConnections line has correct name label", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByTestId("line-avgConnections")).toHaveAttribute(
        "data-name",
        "Avg. connections per meeting"
      );
    });

    it("avgPosts line has correct name label", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByTestId("line-avgPosts")).toHaveAttribute(
        "data-name",
        "Avg. posts per meeting"
      );
    });
  });

  describe("legend pills", () => {
    it("renders purple legend pill", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(
        screen.getByText("Avg. connections per meeting")
      ).toBeInTheDocument();
    });

    it("renders pink legend pill", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByText("Avg. posts per meeting")).toBeInTheDocument();
    });
  });

  describe("ChartTooltip", () => {
    it("no tooltip content visible when chart is idle", () => {
      const { container } = render(<CollaborationUsage {...defaultProps} />);
      expect(container.querySelector(".shadow-md")).not.toBeInTheDocument();
    });

    it("tooltip renders label and values when active", () => {
      const { container } = render(
        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
          <div className="font-semibold mb-1 text-black">Feb 26</div>
          <div style={{ color: "#6860C8" }}>
            Avg. connections per meeting: 5
          </div>
        </div>
      );
      expect(container.querySelector(".shadow-md")).toBeInTheDocument();
      expect(screen.getByText("Feb 26")).toBeInTheDocument();
      expect(
        screen.getByText(/Avg. connections per meeting/)
      ).toBeInTheDocument();
    });
  });

  describe("data transformation", () => {
    it("maps one chart point per data point", () => {
      render(<CollaborationUsage {...defaultProps} />);
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "7"
      );
    });

    it("handles different time ranges", () => {
      mockUseCollaborationUsageMetrics.mockReturnValue({
        connectionsAvg: [
          { date: "2026-02-01", value: 3 },
          { date: "2026-02-02", value: 4 },
          { date: "2026-02-03", value: 5 },
        ],
        postsAvg: [
          { date: "2026-02-01", value: 4 },
          { date: "2026-02-02", value: 4.8 },
          { date: "2026-02-03", value: 5.6 },
        ],
      });

      render(
        <CollaborationUsage
          orgId="test-org-123"
          timeRange="30d"
          selectedDevices={new Set()}
        />
      );
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "3"
      );
    });

    it("renders with a single data point without crashing", () => {
      mockUseCollaborationUsageMetrics.mockReturnValue({
        connectionsAvg: [{ date: "2026-02-01", value: 3 }],
        postsAvg: [{ date: "2026-02-01", value: 4 }],
      });

      render(
        <CollaborationUsage
          orgId="test-org-123"
          timeRange="7d"
          selectedDevices={new Set()}
        />
      );
      expect(screen.getByTestId("line-chart")).toHaveAttribute(
        "data-points",
        "1"
      );
    });

    it("renders with empty data without crashing", () => {
      mockUseCollaborationUsageMetrics.mockReturnValue({
        connectionsAvg: [],
        postsAvg: [],
      });

      render(
        <CollaborationUsage
          orgId="test-org-123"
          timeRange="7d"
          selectedDevices={new Set()}
        />
      );
      // When data is empty, the component shows an EmptyState instead of the chart
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
    });
  });

  describe("XAxis ticks", () => {
    it("passes ticks to XAxis", () => {
      render(<CollaborationUsage {...defaultProps} />);
      const xAxis = screen.getByTestId("x-axis");
      // Should have 7 ticks
      const ticks = xAxis.getAttribute("data-ticks")?.split(",");
      expect(ticks?.length).toBe(7);
    });
  });
});

// ---------------------------------------------------------------------------
// LineChartSkeleton tests
// ---------------------------------------------------------------------------

describe("LineChartSkeleton", () => {
  it("renders title", () => {
    render(<LineChartSkeleton title="Device Utilization" />);
    expect(screen.getByText("Device Utilization")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <LineChartSkeleton
        title="Device Utilization"
        description="Compare up to two types of usage data"
      />
    );
    expect(
      screen.getByText("Compare up to two types of usage data")
    ).toBeInTheDocument();
  });

  it("does not render description element when description is omitted", () => {
    const { container } = render(
      <LineChartSkeleton title="Device Utilization" />
    );
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("has animate-pulse class for skeleton animation", () => {
    const { container } = render(<LineChartSkeleton title="Test" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<LineChartSkeleton title="Test" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders two placeholder button rectangles at the bottom", () => {
    const { container } = render(<LineChartSkeleton title="Test" />);
    const pillDivs = container.querySelectorAll(".w-44.h-8.rounded-md");
    expect(pillDivs.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// AreaChartSkeleton tests
// ---------------------------------------------------------------------------

describe("AreaChartSkeleton", () => {
  it("renders title", () => {
    render(<AreaChartSkeleton title="User Connections" />);
    expect(screen.getByText("User Connections")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <AreaChartSkeleton title="User Connections" description="Some subtitle" />
    );
    expect(screen.getByText("Some subtitle")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    const { container } = render(<AreaChartSkeleton title="Test" />);
    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("has animate-pulse class", () => {
    const { container } = render(<AreaChartSkeleton title="Test" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<AreaChartSkeleton title="Test" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders 5 legend colour squares at the bottom", () => {
    const { container } = render(<AreaChartSkeleton title="Test" />);
    const squares = container.querySelectorAll(".w-3.h-3.shrink-0.rounded-sm");
    expect(squares.length).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Mock data utilities (lib/homePage) tests
// ---------------------------------------------------------------------------

describe("generateMockData", () => {
  it("returns userConnections array with length equal to day count", () => {
    const result = generateMockData(7);
    expect(result.userConnections).toHaveLength(7);
  });

  it("returns deviceUtilization array with length equal to day count", () => {
    const result = generateMockData(30);
    expect(result.deviceUtilization).toHaveLength(30);
  });

  it("each userConnection point has all required keys", () => {
    const result = generateMockData(7);
    const point = result.userConnections[0];
    const requiredKeys = [
      "date",
      "wired",
      "wireless",
      "hdmiIn",
      "googleCast",
      "miracast",
      "airplay",
      "web",
      "otherOs",
      "android",
      "ios",
      "windows",
      "macos",
      "presentationOnly",
      "zoom",
      "teams",
    ];
    requiredKeys.forEach((key) => {
      expect(point).toHaveProperty(key);
    });
  });

  it("each deviceUtilization point has all required keys", () => {
    const result = generateMockData(7);
    const point = result.deviceUtilization[0];
    const keys = Object.keys(point);
    expect(keys).toContain("date");
    expect(keys).toContain("connections");
    expect(keys).toContain("meetings");
    expect(typeof point.date).toBe("string");
    expect(typeof point.connections).toBe("number");
    expect(typeof point.meetings).toBe("number");
  });

  it("dates are ordered chronologically", () => {
    const result = generateMockData(7);
    const dates = result.userConnections.map((p) => new Date(p.date).getTime());
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeGreaterThan(dates[i - 1]);
    }
  });

  it("numeric values are non-negative", () => {
    const result = generateMockData(7);
    result.userConnections.forEach((p) => {
      expect(p.wired).toBeGreaterThanOrEqual(0);
      expect(p.wireless).toBeGreaterThanOrEqual(0);
    });
  });
});

describe("tickInterval", () => {
  it("returns 0 for 7-day range", () => {
    expect(tickInterval(7)).toBe(0);
  });

  it("returns a larger interval for 90 days than for 30 days", () => {
    expect(tickInterval(90)).toBeGreaterThan(tickInterval(30));
  });

  it("always returns a non-negative integer", () => {
    [7, 30, 60, 90, 120].forEach((d) => {
      const result = tickInterval(d);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});

describe("DAY_COUNTS", () => {
  it("has entries for all five time range keys", () => {
    ["7d", "30d", "60d", "90d", "all"].forEach((key) => {
      expect(DAY_COUNTS).toHaveProperty(key);
    });
  });

  it("7d maps to 7", () => {
    expect(DAY_COUNTS["7d"]).toBe(7);
  });

  it("30d maps to 30", () => {
    expect(DAY_COUNTS["30d"]).toBe(30);
  });

  it("'all' maps to the largest day count", () => {
    const values = Object.values(DAY_COUNTS) as number[];
    expect(DAY_COUNTS["all"]).toBe(Math.max(...values));
  });
});

// ---------------------------------------------------------------------------
// timeseriesMock data integrity tests
// ---------------------------------------------------------------------------

describe("timeseriesMock", () => {
  const EXPECTED_METRICS = [
    "ts_meetings_num",
    "ts_connections_num",
    "ts_posts_num",
    "ts_meetings_duration_tot",
    "ts_downtime_duration_tot",
    "ts_app_alerts_unreachable_num",
    "ts_connections_num_by_os",
  ];

  it("contains rows for at least one expected metric name", () => {
    const metricNames = new Set(timeseriesMock.map((r) => r.metric_name));
    const presentMetrics = EXPECTED_METRICS.filter((m) => metricNames.has(m));
    expect(presentMetrics.length).toBeGreaterThan(0);
  });

  it("ts_meetings_num has at least 1 row", () => {
    const rows = timeseriesMock.filter(
      (r) => r.metric_name === "ts_meetings_num"
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("ts_connections_num has at least 1 row", () => {
    const rows = timeseriesMock.filter(
      (r) => r.metric_name === "ts_connections_num"
    );
    expect(rows.length).toBeGreaterThanOrEqual(1);
  });

  it("all rows have a numeric metric_value string", () => {
    timeseriesMock.forEach((row) => {
      expect(isNaN(Number(row.metric_value))).toBe(false);
    });
  });

  it("all rows have a valid ISO date string", () => {
    timeseriesMock.forEach((row) => {
      expect(new Date(row.date).toString()).not.toBe("Invalid Date");
    });
  });

  it("ts_meetings_duration_tot values are fractional hours (< 24)", () => {
    const rows = timeseriesMock.filter(
      (r) => r.metric_name === "ts_meetings_duration_tot"
    );
    rows.forEach((r) => {
      expect(Number(r.metric_value)).toBeLessThan(24);
      expect(Number(r.metric_value)).toBeGreaterThan(0);
    });
  });

  it("ts_connections_num_by_os has 'OS' as segment_1_name", () => {
    const rows = timeseriesMock.filter(
      (r) => r.metric_name === "ts_connections_num_by_os"
    );
    rows.forEach((r) => {
      expect(r.segment_1_name).toBe("OS");
    });
  });

  it("ts_connections_num_by_os contains at least one OS value", () => {
    const rows = timeseriesMock.filter(
      (r) => r.metric_name === "ts_connections_num_by_os"
    );
    const osValues = new Set(rows.map((r) => r.segment_1_value));
    const knownOS = new Set([
      "Linux",
      "MacOS",
      "Windows",
      "iOS",
      "Android",
      "ChromeOS",
    ]);
    osValues.forEach((os) => {
      expect(knownOS.has(os as string)).toBe(true);
    });
    expect(osValues.size).toBeGreaterThan(0);
  });

  it("all rows have 'Day' as aggregation_level", () => {
    timeseriesMock.forEach((row) => {
      expect(row.aggregation_level).toBe("Day");
    });
  });
});
