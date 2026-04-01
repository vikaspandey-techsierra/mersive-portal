import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AlertsChart from "@/components/AlertChart";

const mockUseAlertsChart = jest.fn();

jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useAlertsChart: (...args: any[]) => mockUseAlertsChart(...args),
}));

const ALERT_DATA = [
  {
    date: "2026-02-26",
    ts_app_alerts_unreachable_num: 4,
    ts_app_alerts_rebooted_num: 3,
    ts_app_alerts_template_unassigned_num: 5,
    ts_app_alerts_usb_out_num: 2,
    ts_app_alerts_usb_in_num: 2,
    ts_app_alerts_onboarded_num: 2,
    ts_app_alerts_plan_assigned_num: 1,
  },
  {
    date: "2026-02-27",
    ts_app_alerts_unreachable_num: 6,
    ts_app_alerts_rebooted_num: 5,
    ts_app_alerts_template_unassigned_num: 7,
    ts_app_alerts_usb_out_num: 3,
    ts_app_alerts_usb_in_num: 3,
    ts_app_alerts_onboarded_num: 2,
    ts_app_alerts_plan_assigned_num: 2,
  },
];

const ALL_KEYS = [
  "ts_app_alerts_unreachable_num",
  "ts_app_alerts_rebooted_num",
  "ts_app_alerts_template_unassigned_num",
  "ts_app_alerts_usb_out_num",
  "ts_app_alerts_usb_in_num",
  "ts_app_alerts_onboarded_num",
  "ts_app_alerts_plan_assigned_num",
] as const;

const ALL_LABELS = [
  "Unreachable",
  "Rebooted",
  "Unassigned from template",
  "USB unplugged",
  "USB plugged in",
  "Onboarded",
  "Plan assigned",
];

// Define a type for the alert data
type AlertDataPoint = {
  date: string;
  ts_app_alerts_unreachable_num: number;
  ts_app_alerts_rebooted_num: number;
  ts_app_alerts_template_unassigned_num: number;
  ts_app_alerts_usb_out_num: number;
  ts_app_alerts_usb_in_num: number;
  ts_app_alerts_onboarded_num: number;
  ts_app_alerts_plan_assigned_num: number;
};

jest.mock("@/components/charts/ChartsTooltip", () => ({
  ChartTooltip: ({ labelMap }: { labelMap: Record<string, string> }) => (
    <div data-testid="chart-tooltip">Tooltip Content</div>
  ),
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
  const actual = jest.requireActual("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
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
    Area: ({
      dataKey,
      fill,
      name,
    }: {
      dataKey: string;
      fill: string;
      name?: string;
    }) => (
      <div data-testid={`area-${dataKey}`} data-fill={fill} data-name={name} />
    ),
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: ({ content }: { content?: React.ReactNode }) => (
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

const renderChart = (
  orgId = "test-org-123",
  timeRange = "7d",
  selectedDevices = new Set<string>()
) =>
  render(
    <AlertsChart
      orgId={orgId}
      timeRange={timeRange}
      selectedDevices={selectedDevices}
    />
  );

describe("AlertsChart", () => {
  beforeEach(() => {
    mockUseAlertsChart.mockReturnValue({ data: ALERT_DATA });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Heading & description ─────────────────────────────────────────────────
  describe("heading and description", () => {
    it("renders the Alerts heading", () => {
      renderChart();
      expect(screen.getByText("Alerts")).toBeInTheDocument();
    });

    it("renders the description text", () => {
      renderChart();
      expect(
        screen.getByText(/Monitor the quantity and which types of alerts/)
      ).toBeInTheDocument();
    });
  });

  // ── Chart structure ───────────────────────────────────────────────────────
  describe("chart structure", () => {
    it("renders an AreaChart with correct data length", () => {
      renderChart();
      expect(screen.getByTestId("area-chart")).toHaveAttribute(
        "data-points",
        "2"
      );
    });

    it("renders all 7 Area components by default", () => {
      renderChart();
      ALL_KEYS.forEach((key) =>
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument()
      );
    });

    it("CartesianGrid is rendered", () => {
      renderChart();
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
    });
  });

  // ── Area fill colours ─────────────────────────────────────────────────────
  describe("Area fill colours", () => {
    const COLOR_MAP: Record<string, string> = {
      ts_app_alerts_unreachable_num: "#5B5BD6",
      ts_app_alerts_rebooted_num: "#C34F7D",
      ts_app_alerts_template_unassigned_num: "#5F87C2",
      ts_app_alerts_usb_out_num: "#8B1A00",
      ts_app_alerts_usb_in_num: "#8A9B2F",
      ts_app_alerts_onboarded_num: "#D47A00",
      ts_app_alerts_plan_assigned_num: "#8E56C2",
    };

    Object.entries(COLOR_MAP).forEach(([key, color]) => {
      it(`${key} area uses colour ${color}`, () => {
        renderChart();
        expect(screen.getByTestId(`area-${key}`)).toHaveAttribute(
          "data-fill",
          color
        );
      });
    });
  });

  // ── Legend labels ─────────────────────────────────────────────────────────
  describe("legend labels", () => {
    it("renders all 7 legend labels", () => {
      renderChart();
      ALL_LABELS.forEach((label) =>
        expect(screen.getByText(label)).toBeInTheDocument()
      );
    });
  });

  // ── Series toggles ────────────────────────────────────────────────────────
  describe("series toggle", () => {
    it("clicking a legend label hides its Area", () => {
      renderChart();
      fireEvent.click(screen.getByText("Unreachable"));
      expect(
        screen.queryByTestId("area-ts_app_alerts_unreachable_num")
      ).not.toBeInTheDocument();
    });

    it("clicking a hidden label re-shows its Area", () => {
      renderChart();
      fireEvent.click(screen.getByText("Unreachable"));
      fireEvent.click(screen.getByText("Unreachable"));
      expect(
        screen.getByTestId("area-ts_app_alerts_unreachable_num")
      ).toBeInTheDocument();
    });

    it("hiding one series does not affect others", () => {
      renderChart();
      fireEvent.click(screen.getByText("Rebooted"));
      expect(
        screen.queryByTestId("area-ts_app_alerts_rebooted_num")
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("area-ts_app_alerts_unreachable_num")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("area-ts_app_alerts_template_unassigned_num")
      ).toBeInTheDocument();
    });

    it("can hide multiple series independently", () => {
      renderChart();
      fireEvent.click(screen.getByText("Unreachable"));
      fireEvent.click(screen.getByText("Rebooted"));
      expect(
        screen.queryByTestId("area-ts_app_alerts_unreachable_num")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("area-ts_app_alerts_rebooted_num")
      ).not.toBeInTheDocument();
      expect(
        screen.getByTestId("area-ts_app_alerts_template_unassigned_num")
      ).toBeInTheDocument();
    });

    it("cannot toggle off the last active series", () => {
      renderChart();
      // Disable all except one
      ALL_LABELS.slice(1).forEach((label) =>
        fireEvent.click(screen.getByText(label))
      );
      // Try to disable the last one - should not work
      fireEvent.click(screen.getByText(ALL_LABELS[0]));
      expect(
        screen.getByTestId("area-ts_app_alerts_unreachable_num")
      ).toBeInTheDocument();
    });
  });

  // ── Empty state ────────────────────────────────────────────────────────────
  describe("empty state", () => {
    it("shows empty state when data is empty", () => {
      mockUseAlertsChart.mockReturnValue({ data: [] });
      renderChart();
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(
        screen.getByText("No data for this date range")
      ).toBeInTheDocument();
    });

    it("renders correctly with a single data point", () => {
      mockUseAlertsChart.mockReturnValue({ data: [ALERT_DATA[0]] });
      renderChart();
      expect(screen.getByTestId("area-chart")).toHaveAttribute(
        "data-points",
        "1"
      );
    });

    it("renders all areas even when all values are 0", () => {
      const zeroData: AlertDataPoint[] = ALERT_DATA.map((d) => {
        const newData: AlertDataPoint = {
          date: d.date,
          ts_app_alerts_unreachable_num: 0,
          ts_app_alerts_rebooted_num: 0,
          ts_app_alerts_template_unassigned_num: 0,
          ts_app_alerts_usb_out_num: 0,
          ts_app_alerts_usb_in_num: 0,
          ts_app_alerts_onboarded_num: 0,
          ts_app_alerts_plan_assigned_num: 0,
        };
        return newData;
      });
      mockUseAlertsChart.mockReturnValue({ data: zeroData });
      renderChart();
      ALL_KEYS.forEach((key) =>
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument()
      );
    });
  });
});
