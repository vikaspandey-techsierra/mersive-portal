import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserConnections from "@/components/UserConnectionsChart";

const mockUseFilteredSegmentedPoints = jest.fn();

jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useFilteredSegmentedPoints: (...args: any[]) =>
    mockUseFilteredSegmentedPoints(...args),
  useUserConnectionsMetrics: jest.fn().mockReturnValue([]),
}));

jest.mock("@/lib/analytics/utils/helpers", () => ({
  buildAvailableDimensions: jest.fn().mockReturnValue([
    { metric: "ts_connections_num_by_protocol", label: "Protocol" },
    { metric: "ts_connections_num_by_mode", label: "Mode" },
    { metric: "ts_connections_num_by_os", label: "Operating System" },
    { metric: "ts_connections_num_by_conference", label: "Conference" },
  ]),
  formatShortDate: (date: string) => {
    // Simple date formatter for tests
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  },
  getSevenTicks: (labels: string[]) => {
    if (labels.length === 0) return [];
    const step = Math.max(1, Math.floor(labels.length / 7));
    return labels.filter((_, i) => i % step === 0).slice(0, 7);
  },
}));

const mockSegmentedData = [
  { date: "2026-02-26", segment: "HDMI in", value: 2 },
  { date: "2026-02-26", segment: "Google Cast", value: 1 },
  { date: "2026-02-26", segment: "Miracast", value: 1 },
  { date: "2026-02-26", segment: "AirPlay", value: 2 },
  { date: "2026-02-26", segment: "Web", value: 2 },
  { date: "2026-02-27", segment: "HDMI in", value: 3 },
  { date: "2026-02-27", segment: "Google Cast", value: 2 },
  { date: "2026-02-27", segment: "Miracast", value: 1 },
  { date: "2026-02-27", segment: "AirPlay", value: 2 },
  { date: "2026-02-27", segment: "Web", value: 2 },
  { date: "2026-02-28", segment: "HDMI in", value: 2 },
  { date: "2026-02-28", segment: "Google Cast", value: 2 },
  { date: "2026-02-28", segment: "Miracast", value: 1 },
  { date: "2026-02-28", segment: "AirPlay", value: 2 },
  { date: "2026-02-28", segment: "Web", value: 3 },
  { date: "2026-03-01", segment: "HDMI in", value: 2 },
  { date: "2026-03-01", segment: "Google Cast", value: 1 },
  { date: "2026-03-01", segment: "Miracast", value: 2 },
  { date: "2026-03-01", segment: "AirPlay", value: 2 },
  { date: "2026-03-01", segment: "Web", value: 2 },
];

const mockModeData = [
  { date: "2026-02-26", segment: "Wired", value: 3 },
  { date: "2026-02-26", segment: "Wireless", value: 5 },
  { date: "2026-02-27", segment: "Wired", value: 4 },
  { date: "2026-02-27", segment: "Wireless", value: 6 },
  { date: "2026-02-28", segment: "Wired", value: 3 },
  { date: "2026-02-28", segment: "Wireless", value: 5 },
];

const mockOSData = [
  { date: "2026-02-26", segment: "Windows", value: 3 },
  { date: "2026-02-26", segment: "macOS", value: 5 },
  { date: "2026-02-26", segment: "iOS", value: 2 },
  { date: "2026-02-26", segment: "Android", value: 2 },
  { date: "2026-02-27", segment: "Windows", value: 4 },
  { date: "2026-02-27", segment: "macOS", value: 6 },
  { date: "2026-02-27", segment: "iOS", value: 2 },
  { date: "2026-02-27", segment: "Android", value: 2 },
];

const mockConferenceData = [
  { date: "2026-02-26", segment: "Presentation Only", value: 4 },
  { date: "2026-02-26", segment: "Zoom", value: 2 },
  { date: "2026-02-26", segment: "Teams", value: 2 },
  { date: "2026-02-27", segment: "Presentation Only", value: 5 },
  { date: "2026-02-27", segment: "Zoom", value: 2 },
  { date: "2026-02-27", segment: "Teams", value: 2 },
];

jest.mock("recharts", () => {
  const Original = jest.requireActual("recharts");
  return {
    ...Original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
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
      name,
      stroke,
      fill,
    }: {
      dataKey: string;
      name: string;
      stroke: string;
      fill: string;
    }) => (
      <div
        data-testid={`area-${dataKey}`}
        data-name={name}
        data-stroke={stroke}
        data-fill={fill}
      />
    ),
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
  };
});

jest.mock("../components/icons/phonelink.svg", () => "phonelink-icon", {
  virtual: true,
});

interface TestProps {
  orgId?: string;
  timeRange?: string;
  title: string;
  subtitle?: string;
  selectedDevices?: Set<string>;
}

const defaultProps: TestProps = {
  orgId: "test-org-123",
  timeRange: "7d",
  title: "User Connections",
  subtitle:
    "Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used",
  selectedDevices: new Set(),
};

const renderComponent = (props: Partial<TestProps> = {}) =>
  render(<UserConnections {...defaultProps} {...props} />);

describe("UserConnections", () => {
  // Get the mocked hook reference
  const { useUserConnectionsMetrics } = jest.requireMock(
    "@/lib/analytics/hooks/useTimeSeriesMetrics"
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for useUserConnectionsMetrics
    useUserConnectionsMetrics.mockReturnValue(mockSegmentedData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Static content ─────────────────────────────────────────────────────────

  describe("static content", () => {
    it("renders the title", () => {
      renderComponent();
      expect(screen.getByText("User Connections")).toBeInTheDocument();
    });

    it("renders the subtitle", () => {
      renderComponent();
      expect(screen.getByText(/Compare connection modes/)).toBeInTheDocument();
    });

    it("renders without subtitle when omitted", () => {
      renderComponent({ subtitle: undefined });
      // The component renders an empty subtitle div rather than omitting it entirely,
      // so check there is no visible subtitle text instead
      expect(
        screen.queryByText(/Compare connection modes/)
      ).not.toBeInTheDocument();
    });

    it("renders the area chart", () => {
      renderComponent();
      expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });
  });

  // ── Default group (Protocol) ───────────────────────────────────────────────

  describe("default group — Protocol", () => {
    const PROTOCOL_KEYS = [
      "HDMI in",
      "Google Cast",
      "Miracast",
      "AirPlay",
      "Web",
    ];

    it("renders an Area for each protocol series by default", () => {
      renderComponent();
      PROTOCOL_KEYS.forEach((key) => {
        // The dataKey is the segment name, which may have spaces
        const area = screen.getByTestId(`area-${key}`);
        expect(area).toBeInTheDocument();
      });
    });

    it("protocol legend items are visible", () => {
      renderComponent();
      ["HDMI in", "Google Cast", "Miracast", "AirPlay", "Web"].forEach(
        (label) => {
          expect(screen.getByText(label)).toBeInTheDocument();
        }
      );
    });
  });

  // ── Group switching via dropdown ───────────────────────────────────────────

  describe("group switching", () => {
    it("renders a group select dropdown", () => {
      renderComponent();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("switches to Mode group and shows Wired / Wireless areas", () => {
      const { useUserConnectionsMetrics } = jest.requireMock(
        "@/lib/analytics/hooks/useTimeSeriesMetrics"
      );
      useUserConnectionsMetrics.mockReturnValue(mockModeData);
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "ts_connections_num_by_mode" },
      });
      expect(screen.getByTestId("area-Wired")).toBeInTheDocument();
      expect(screen.getByTestId("area-Wireless")).toBeInTheDocument();
    });

    it("switches to OS group and shows OS areas", () => {
      const { useUserConnectionsMetrics } = jest.requireMock(
        "@/lib/analytics/hooks/useTimeSeriesMetrics"
      );
      useUserConnectionsMetrics.mockReturnValue(mockOSData);
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "ts_connections_num_by_os" },
      });
      ["Windows", "macOS", "iOS", "Android"].forEach((key) => {
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument();
      });
    });

    it("switches to Conference group and shows conference areas", () => {
      const { useUserConnectionsMetrics } = jest.requireMock(
        "@/lib/analytics/hooks/useTimeSeriesMetrics"
      );
      useUserConnectionsMetrics.mockReturnValue(mockConferenceData);
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "ts_connections_num_by_conference" },
      });
      ["Presentation Only", "Zoom", "Teams"].forEach((key) => {
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument();
      });
    });
  });

  // ── Series toggle (checkbox) ───────────────────────────────────────────────

  describe("series toggle", () => {
    it("all series are checked by default", () => {
      renderComponent();
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });

    it("unchecking a series disables its checkbox", () => {
      renderComponent();
      const checkbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("re-checking a series enables it", () => {
      renderComponent();
      const checkbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(checkbox);
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it("last active series cannot be unchecked", () => {
      renderComponent();
      const checkboxes = screen.getAllByRole("checkbox");
      // Uncheck all but one
      for (let i = 1; i < checkboxes.length; i++) {
        fireEvent.click(checkboxes[i]);
      }
      // The last remaining checkbox should be disabled
      expect(checkboxes[0]).toBeDisabled();
    });
  });

  // ── Colour mapping ────────────────────────────────────────────────────────

  describe("colour mapping", () => {
    it("different segments have different colors", () => {
      renderComponent();
      const areas = screen.getAllByTestId(/^area-/);
      const colors = areas.map((area) => area.getAttribute("data-stroke"));
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBeGreaterThan(1);
    });
  });

  // ── Empty data ────────────────────────────────────────────────────────────

  describe("empty data", () => {
    it("renders empty state when no data is available", () => {
      const { useUserConnectionsMetrics } = jest.requireMock(
        "@/lib/analytics/hooks/useTimeSeriesMetrics"
      );
      useUserConnectionsMetrics.mockReturnValue([]);
      renderComponent();
      expect(
        screen.getByText("No data for this date range")
      ).toBeInTheDocument();
    });
  });
});
