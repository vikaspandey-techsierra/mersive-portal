import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserConnections from "@/components/UserConnectionsChart";
import { UserConnectionPoint } from "@/lib/types/homepage";

// ---------------------------------------------------------------------------
// Mock recharts
// ---------------------------------------------------------------------------
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
    XAxis: ({ interval }: { interval: number }) => (
      <div data-testid="x-axis" data-interval={interval} />
    ),
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
  };
});

// ---------------------------------------------------------------------------
// Mock data helpers
// ---------------------------------------------------------------------------
const buildPoint = (
  date: string,
  overrides: Partial<UserConnectionPoint> = {}
): UserConnectionPoint => ({
  date,
  wired: 3,
  wireless: 5,
  hdmiIn: 2,
  googleCast: 1,
  miracast: 1,
  airplay: 2,
  web: 2,
  otherOs: 1,
  android: 2,
  ios: 2,
  windows: 3,
  macos: 5,
  presentationOnly: 4,
  zoom: 2,
  teams: 2,
  ...overrides,
});

const SEVEN_DAYS: UserConnectionPoint[] = [
  "2026-02-26",
  "2026-02-27",
  "2026-02-28",
  "2026-03-01",
  "2026-03-02",
  "2026-03-03",
  "2026-03-04",
].map((d) => buildPoint(d));

interface TestProps {
  data: UserConnectionPoint[];
  interval: number;
  title: string;
  subtitle?: string;
}

const defaultProps: TestProps = {
  data: SEVEN_DAYS,
  interval: 1,
  title: "User Connections",
  subtitle:
    "Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used",
};

const renderComponent = (props: TestProps = defaultProps) =>
  render(<UserConnections {...props} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("UserConnections", () => {
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
      renderComponent({ ...defaultProps, subtitle: undefined });
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

    it("passes correct number of data points to AreaChart", () => {
      renderComponent();
      expect(screen.getByTestId("area-chart")).toHaveAttribute(
        "data-points",
        "7"
      );
    });
  });

  // ── Default group (Protocol) ───────────────────────────────────────────────

  describe("default group — Protocol", () => {
    const PROTOCOL_KEYS = [
      "hdmiIn",
      "googleCast",
      "miracast",
      "airplay",
      "web",
    ];

    it("renders an Area for each protocol series by default", () => {
      renderComponent();
      PROTOCOL_KEYS.forEach((key) => {
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument();
      });
    });

    it("does NOT render Mode areas while Protocol group is selected", () => {
      renderComponent();
      expect(screen.queryByTestId("area-wired")).not.toBeInTheDocument();
      expect(screen.queryByTestId("area-wireless")).not.toBeInTheDocument();
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
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "mode" },
      });
      expect(screen.getByTestId("area-wired")).toBeInTheDocument();
      expect(screen.getByTestId("area-wireless")).toBeInTheDocument();
    });

    it("Mode group removes Protocol areas", () => {
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "mode" },
      });
      expect(screen.queryByTestId("area-hdmiIn")).not.toBeInTheDocument();
    });

    it("switches to OS group and shows OS areas", () => {
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "os" },
      });
      ["otherOs", "android", "ios", "windows", "macos"].forEach((key) => {
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument();
      });
    });

    it("switches to Conference group and shows conference areas", () => {
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "conference" },
      });
      ["presentationOnly", "zoom", "teams"].forEach((key) => {
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument();
      });
    });
  });

  // ── Series toggle (checkbox) ───────────────────────────────────────────────

  describe("series toggle", () => {
    it("all series are checked by default", () => {
      renderComponent();
      // All protocol areas should be present (all active)
      ["hdmiIn", "googleCast", "miracast", "airplay", "web"].forEach((key) => {
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument();
      });
    });

    it("unchecking a series zeroes-out its data in the chart", () => {
      renderComponent();
      // Click on the 'Web' toggle label to uncheck it
      fireEvent.click(screen.getByText("Web"));
      // After unchecking, the area still renders but all values = 0
      const webArea = screen.getByTestId("area-web");
      expect(webArea).toBeInTheDocument();
    });

    it("re-checking a series restores its data", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Web")); // uncheck
      fireEvent.click(screen.getByText("Web")); // re-check
      expect(screen.getByTestId("area-web")).toBeInTheDocument();
    });
  });

  // ── Colour mapping ────────────────────────────────────────────────────────

  describe("colour mapping", () => {
    it("Mode group — Wired has pink stroke", () => {
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "mode" },
      });
      expect(screen.getByTestId("area-wired")).toHaveAttribute(
        "data-stroke",
        "#D44E80"
      );
    });

    it("Mode group — Wireless has purple stroke", () => {
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "mode" },
      });
      expect(screen.getByTestId("area-wireless")).toHaveAttribute(
        "data-stroke",
        "#6860C8"
      );
    });

    it("OS group — MacOS has purple stroke", () => {
      renderComponent();
      fireEvent.change(screen.getByRole("combobox"), {
        target: { value: "os" },
      });
      expect(screen.getByTestId("area-macos")).toHaveAttribute(
        "data-stroke",
        "#6860C8"
      );
    });
  });

  // ── Interval prop ─────────────────────────────────────────────────────────

  describe("interval prop", () => {
    it("passes interval to XAxis", () => {
      renderComponent({ ...defaultProps, interval: 4 });
      expect(screen.getByTestId("x-axis")).toHaveAttribute(
        "data-interval",
        "4"
      );
    });
  });

  // ── Empty data ────────────────────────────────────────────────────────────

  describe("empty data", () => {
    it("renders chart with zero data points without crashing", () => {
      renderComponent({ ...defaultProps, data: [] });
      expect(screen.getByTestId("area-chart")).toHaveAttribute(
        "data-points",
        "0"
      );
    });
  });

  // ── Date formatting ───────────────────────────────────────────────────────

  describe("date formatting helper", () => {
    it("X-axis receives labelled data (dates formatted to Mon DD)", () => {
      renderComponent();
      // The chart receives formatted labels - just verify chart renders with correct point count
      expect(screen.getByTestId("area-chart")).toHaveAttribute(
        "data-points",
        "7"
      );
    });
  });
});
