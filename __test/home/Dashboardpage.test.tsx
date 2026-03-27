import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/pages/home/page";

// ---------------------------------------------------------------------------
// Next.js Image
// ---------------------------------------------------------------------------
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// ---------------------------------------------------------------------------
// SVG imports
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Lucide
// ---------------------------------------------------------------------------
jest.mock("lucide-react", () => ({
  ChevronDownIcon: () => <span data-testid="chevron-down" />,
  ChevronUpIcon: () => <span data-testid="chevron-up" />,
  ExternalLinkIcon: () => <span data-testid="external-link" />,
}));

// ---------------------------------------------------------------------------
// Recharts
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
jest.mock("@/components/Sidebar", () => ({
  __esModule: true,
  default: () => <nav data-testid="sidebar">Sidebar</nav>,
}));

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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("DashboardPage", () => {
  it("renders without crashing", () => {
    render(<DashboardPage />);
  });

  it("renders the sidebar", () => {
    render(<DashboardPage />);
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders the AlertBanner with admin attention heading", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Requires admin attention")).toBeInTheDocument();
  });

  it("renders stat card labels", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Meetings underway")).toBeInTheDocument();
    expect(screen.getByText("Device used")).toBeInTheDocument();
    expect(screen.getByText("Average meeting length")).toBeInTheDocument();
    expect(screen.getByText("Busiest time")).toBeInTheDocument();
  });

  it("renders stat card values from hooks", () => {
    render(<DashboardPage />);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText("38 min")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM - 11:00 AM")).toBeInTheDocument();
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
    expect(screen.getByText("Gen 4 Smart")).toBeInTheDocument();
    expect(screen.getByText("Gen 4 Pod")).toBeInTheDocument();
    expect(screen.getByText("Gen 3 Pod")).toBeInTheDocument();
  });

  it("renders device status legend entries", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders fleet health score", () => {
    render(<DashboardPage />);
    expect(screen.getByText("2.8")).toBeInTheDocument();
  });

  it("renders fleet health total devices", () => {
    render(<DashboardPage />);
    expect(screen.getByText("496")).toBeInTheDocument();
  });

  it("renders fleet health devices with issues", () => {
    render(<DashboardPage />);
    expect(screen.getByText("355")).toBeInTheDocument();
  });

  it("renders multiple pie charts", () => {
    render(<DashboardPage />);
    const charts = screen.getAllByTestId("pie-chart");
    expect(charts.length).toBeGreaterThanOrEqual(3);
  });
});
