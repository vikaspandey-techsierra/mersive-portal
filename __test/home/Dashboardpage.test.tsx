import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/[orgId]/home/page";

jest.mock("next/navigation", () => ({
  useParams: jest.fn().mockReturnValue({ orgId: "test-org-123" }),
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: jest.fn().mockReturnValue("/test-org-123/home"),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

jest.mock("@/components/icons/replay.svg", () => "ReplayIcon");
jest.mock("@/components/icons/tv_black.svg", () => "DeviceTypeIcon");
jest.mock("@/components/icons/dvr.svg", () => "PlanTypeIcon");
jest.mock("@/components/icons/health_and_safety.svg", () => "FleetHealthIcon");
jest.mock("@/components/icons/assignment.svg", () => "DeviceStatusIcon");
jest.mock("@/components/icons/error.svg", () => "ErrorIcon");
jest.mock("@/components/icons/tv_off.svg", () => "TvOffIcon");
jest.mock("@/components/icons/event_busy.svg", () => "CalendarIcon");
jest.mock("@/components/icons/outdated_firmware.svg", () => "DownloadIcon");
jest.mock("@/components/icons/warning.svg", () => "AlertIcon");
jest.mock("@/components/icons/tv.svg", () => "MonitorIcon");
jest.mock("@/components/icons/person.svg", () => "PersonIcon");
jest.mock("@/components/icons/schedule.svg", () => "ScheduleIcon");
jest.mock("@/components/icons/trending_up.svg", () => "TrendingIcon");
jest.mock("@/components/icons/help.svg", () => "HelpIcon");
jest.mock("@/components/icons/feed.svg", () => "FeedIcon");

jest.mock("lucide-react", () => ({
  ChevronDownIcon: () => <span data-testid="chevron-down" />,
  ChevronUpIcon: () => <span data-testid="chevron-up" />,
  ExternalLinkIcon: () => <span data-testid="external-link" />,
}));

jest.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/components/Sidebar", () => ({
  __esModule: true,
  default: () => <nav data-testid="sidebar">Sidebar</nav>,
}));

jest.mock("@/components/home/AlertBanner", () => ({
  __esModule: true,
  default: ({ alert }: any) => (
    <div data-testid="alert-banner">
      Requires admin attention: {alert.offlineDevices} offline,{" "}
      {alert.expiredOrExpiringSoon} expired
    </div>
  ),
}));

jest.mock("@/components/home/StatCards", () => ({
  __esModule: true,
  default: ({ stats }: any) => (
    <div data-testid="stat-cards">
      <div>Meetings underway: {stats.meetingsUnderway}</div>
      <div>Device used: {stats.activeUsers}</div>
      <div>Average meeting length: {stats.avgMeetingLengthMin} min</div>
      <div>Busiest time: {stats.busiestTimeLabel}</div>
    </div>
  ),
}));

jest.mock("@/components/home/UpdatesSection", () => ({
  __esModule: true,
  default: ({ faqs }: any) => (
    <div data-testid="updates-section">
      <div>Updates Section</div>
      <div>{faqs.length} FAQs</div>
    </div>
  ),
}));

jest.mock("@/components/charts/device-type/DeviceTypeDonut", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div data-testid="device-type-donut">
      {data.map((item: any) => (
        <div key={item.name}>{item.name}</div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/charts/device-status/DeviceStatusPie", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div data-testid="device-status-pie">
      {data.map((item: any) => (
        <div key={item.name}>{item.name}</div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/charts/plan-type/PlanTypePie", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div data-testid="plan-type-pie">
      {data.map((item: any) => (
        <div key={item.name}>{item.name}</div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/charts/fleet-health/FleetHealthGauge", () => ({
  __esModule: true,
  default: ({ score, totalDevices, devicesWithIssues }: any) => (
    <div data-testid="fleet-health-gauge">
      <div>Score: {score}</div>
      <div>Total: {totalDevices}</div>
      <div>Issues: {devicesWithIssues}</div>
    </div>
  ),
}));

// Mock skeleton and empty state components
jest.mock("@/components/charts/device-type/DeviceTypeDonutSkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="device-type-skeleton">Loading...</div>,
}));

jest.mock("@/components/charts/device-status/DeviceStatusSkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="device-status-skeleton">Loading...</div>,
}));

jest.mock("@/components/charts/plan-type/PlanTypeSkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="plan-type-skeleton">Loading...</div>,
}));

jest.mock("@/components/charts/fleet-health/FleetHealthSkeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="fleet-health-skeleton">Loading...</div>,
}));

jest.mock("@/components/charts/device-type/DeviceTypeDonutEmptyState", () => ({
  __esModule: true,
  default: () => <div data-testid="device-type-empty">No data</div>,
}));

jest.mock(
  "@/components/charts/device-status/DeviceStatusPieEmptyState",
  () => ({
    __esModule: true,
    default: () => <div data-testid="device-status-empty">No data</div>,
  })
);

jest.mock("@/components/charts/plan-type/PlanTypePieEmptyState", () => ({
  __esModule: true,
  default: () => <div data-testid="plan-type-empty">No data</div>,
}));

jest.mock(
  "@/components/charts/fleet-health/FleetHealthGaugeEmptyState",
  () => ({
    __esModule: true,
    default: () => <div data-testid="fleet-health-empty">No data</div>,
  })
);

// ---------------------------------------------------------------------------
// All snapshot hooks – return deterministic values
// ---------------------------------------------------------------------------
jest.mock("@/lib/analytics/hooks/useSnapshotMetric", () => ({
  useDeviceTypeMetric: () => ({
    data: [
      { name: "Gen 4 Smart", value: 2 },
      { name: "Gen 4 Pod", value: 1 },
      { name: "Gen 3 Pod", value: 5 },
    ],
    createdAt: "2026-03-05 03:00:03",
    loading: false,
  }),
  useDeviceStatusMetric: () => ({
    data: [
      { name: "Offline", value: 2, percent: 67 },
      { name: "Online", value: 1, percent: 33 },
    ],
    loading: false,
  }),
  usePlanTypeMetric: () => ({
    data: [
      { name: "Dev Smart - 1 year", value: 2, percent: 67 },
      { name: "Dev Pro - 1 year", value: 1, percent: 33 },
    ],
    loading: false,
  }),
  useFleetHealthMetric: () => ({
    data: { score: 2.8, totalDevices: 496, devicesWithIssues: 355 },
    loading: false,
  }),
  useOfflineDevicesMetric: () => 3,
  useExpiredDevicesMetric: () => 5,
  useOutdatedFirmwareMetric: () => 2,
  useOtherIssuesMetric: () => 1,
  useMeetingsUnderwayMetric: () => 12,
  useActiveDevicesMetric: () => 45,
  useAvgMeetingLengthMetric: () => 38,
  useBusiestTimeMetric: () => "10:00 AM - 11:00 AM",
}));

jest.mock("@/lib/analytics/utils/helpers", () => ({
  formatDate: (date: string) => {
    return new Date(date).toLocaleDateString();
  },
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders the sidebar", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders the AlertBanner with admin attention heading", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("alert-banner")).toBeInTheDocument();
    expect(screen.getByText(/Requires admin attention/)).toBeInTheDocument();
  });

  it("renders stat card labels", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("stat-cards")).toBeInTheDocument();
    expect(screen.getByText(/Meetings underway: 12/)).toBeInTheDocument();
    expect(screen.getByText(/Device used: 45/)).toBeInTheDocument();
    expect(
      screen.getByText(/Average meeting length: 38 min/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Busiest time: 10:00 AM - 11:00 AM/)
    ).toBeInTheDocument();
  });

  it("renders stat card values from hooks", () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Meetings underway: 12/)).toBeInTheDocument();
    expect(screen.getByText(/Device used: 45/)).toBeInTheDocument();
    expect(
      screen.getByText(/Average meeting length: 38 min/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Busiest time: 10:00 AM - 11:00 AM/)
    ).toBeInTheDocument();
  });

  it("renders the Device Breakdown section header", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Device Breakdown")).toBeInTheDocument();
  });

  it("renders all four device breakdown card titles", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Device Type")).toBeInTheDocument();
    expect(screen.getByText("Device Status")).toBeInTheDocument();
    expect(screen.getByText("Plan Type")).toBeInTheDocument();
    expect(screen.getByText("Overall Fleet Health")).toBeInTheDocument();
  });

  it("renders device type legend entries", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("device-type-donut")).toBeInTheDocument();
    expect(screen.getByText("Gen 4 Smart")).toBeInTheDocument();
    expect(screen.getByText("Gen 4 Pod")).toBeInTheDocument();
    expect(screen.getByText("Gen 3 Pod")).toBeInTheDocument();
  });

  it("renders device status legend entries", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("device-status-pie")).toBeInTheDocument();
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders fleet health score", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("fleet-health-gauge")).toBeInTheDocument();
    expect(screen.getByText("Score: 2.8")).toBeInTheDocument();
  });

  it("renders fleet health total devices", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Total: 496")).toBeInTheDocument();
  });

  it("renders fleet health devices with issues", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Issues: 355")).toBeInTheDocument();
  });

  it("renders multiple charts", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("device-type-donut")).toBeInTheDocument();
    expect(screen.getByTestId("device-status-pie")).toBeInTheDocument();
    expect(screen.getByTestId("plan-type-pie")).toBeInTheDocument();
    expect(screen.getByTestId("fleet-health-gauge")).toBeInTheDocument();
  });

  it("renders the updates section", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("updates-section")).toBeInTheDocument();
    expect(screen.getByText("5 FAQs")).toBeInTheDocument();
  });
});
