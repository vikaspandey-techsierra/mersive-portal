/**
 * @file AlertsChart.test.tsx
 * Tests for AlertsChart component.
 *
 * Covers: structure, all 7 Area elements, correct fill colours, XAxis interval,
 * all 7 legend labels, series toggle on/off/re-on/multi/all, inline tooltip
 * (active/inactive/zero-filter/empty-payload), and edge cases.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AlertsChart, { type AlertPoint } from "@/components/AlertChart";

// ---------------------------------------------------------------------------
// Tooltip state flags (inline function pattern — AlertsChart uses render prop)
// ---------------------------------------------------------------------------
let __tooltipActive = false;
let __tooltipLabel = "";
let __tooltipPayload: {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}[] = [];

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
    XAxis: ({ interval }: { interval?: number }) => (
      <div data-testid="x-axis" data-interval={interval} />
    ),
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    // AlertsChart uses an inline function for Tooltip content (render prop)
    Tooltip: ({
      content,
    }: {
      content?: (...args: unknown[]) => React.ReactNode;
    }) => {
      if (typeof content !== "function" || !__tooltipActive) return <div />;
      const result = content({
        active: __tooltipActive,
        payload: __tooltipPayload,
        label: __tooltipLabel,
      });
      return <>{result}</>;
    },
  };
});

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------
const ALERT_DATA: AlertPoint[] = [
  {
    date: "Dec 16",
    unreachable: 4,
    rebooted: 3,
    unassigned: 5,
    usbUnplugged: 2,
    usbPlugged: 2,
    onboarded: 2,
    planAssigned: 1,
  },
  {
    date: "Dec 17",
    unreachable: 6,
    rebooted: 5,
    unassigned: 7,
    usbUnplugged: 3,
    usbPlugged: 3,
    onboarded: 2,
    planAssigned: 2,
  },
];

const ALL_KEYS = [
  "unreachable",
  "rebooted",
  "unassigned",
  "usbUnplugged",
  "usbPlugged",
  "onboarded",
  "planAssigned",
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

const renderChart = (data = ALERT_DATA, interval = 0) =>
  render(<AlertsChart data={data} interval={interval} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("AlertsChart", () => {
  afterEach(() => {
    __tooltipActive = false;
    __tooltipPayload = [];
    __tooltipLabel = "";
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

    it("XAxis receives the interval prop", () => {
      renderChart(ALERT_DATA, 4);
      expect(screen.getByTestId("x-axis")).toHaveAttribute(
        "data-interval",
        "4"
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
      unreachable: "#5B5BD6",
      rebooted: "#C34F7D",
      unassigned: "#5F87C2",
      usbUnplugged: "#8B1A00",
      usbPlugged: "#8A9B2F",
      onboarded: "#D47A00",
      planAssigned: "#8E56C2",
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
      expect(screen.queryByTestId("area-unreachable")).not.toBeInTheDocument();
    });

    it("clicking a hidden label re-shows its Area", () => {
      renderChart();
      fireEvent.click(screen.getByText("Unreachable"));
      fireEvent.click(screen.getByText("Unreachable"));
      expect(screen.getByTestId("area-unreachable")).toBeInTheDocument();
    });

    it("hiding one series does not affect others", () => {
      renderChart();
      fireEvent.click(screen.getByText("Rebooted"));
      expect(screen.queryByTestId("area-rebooted")).not.toBeInTheDocument();
      expect(screen.getByTestId("area-unreachable")).toBeInTheDocument();
      expect(screen.getByTestId("area-unassigned")).toBeInTheDocument();
    });

    it("can hide multiple series independently", () => {
      renderChart();
      fireEvent.click(screen.getByText("Unreachable"));
      fireEvent.click(screen.getByText("Rebooted"));
      expect(screen.queryByTestId("area-unreachable")).not.toBeInTheDocument();
      expect(screen.queryByTestId("area-rebooted")).not.toBeInTheDocument();
      expect(screen.getByTestId("area-unassigned")).toBeInTheDocument();
    });

    it("can toggle all 7 series off", () => {
      renderChart();
      ALL_LABELS.forEach((label) => fireEvent.click(screen.getByText(label)));
      ALL_KEYS.forEach((key) =>
        expect(screen.queryByTestId(`area-${key}`)).not.toBeInTheDocument()
      );
    });

    it("can restore all series after toggling off", () => {
      renderChart();
      ALL_LABELS.forEach((label) => fireEvent.click(screen.getByText(label)));
      ALL_LABELS.forEach((label) => fireEvent.click(screen.getByText(label)));
      ALL_KEYS.forEach((key) =>
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument()
      );
    });
  });

  // ── Inline Tooltip ────────────────────────────────────────────────────────
  describe("Tooltip", () => {
    it("renders nothing when tooltip is inactive", () => {
      __tooltipActive = false;
      renderChart();
      expect(screen.queryByText("Dec 16")).not.toBeInTheDocument();
    });

    it("renders the date label when active", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 16";
      __tooltipPayload = [
        {
          dataKey: "unreachable",
          name: "Unreachable",
          value: 4,
          color: "#5B5BD6",
        },
      ];
      renderChart();
      expect(screen.getByText("Dec 16")).toBeInTheDocument();
    });

    it("renders series name and value when active", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 16";
      __tooltipPayload = [
        {
          dataKey: "unreachable",
          name: "Unreachable",
          value: 4,
          color: "#5B5BD6",
        },
        { dataKey: "rebooted", name: "Rebooted", value: 3, color: "#C34F7D" },
      ];
      renderChart();
      expect(screen.getByText(/Unreachable: 4/)).toBeInTheDocument();
      expect(screen.getByText(/Rebooted: 3/)).toBeInTheDocument();
    });

    it("filters out entries with value 0", () => {
      __tooltipActive = true;
      __tooltipLabel = "Dec 18";
      __tooltipPayload = [
        {
          dataKey: "unreachable",
          name: "Unreachable",
          value: 0,
          color: "#5B5BD6",
        },
        { dataKey: "rebooted", name: "Rebooted", value: 5, color: "#C34F7D" },
      ];
      renderChart();
      expect(screen.queryByText(/Unreachable:/)).not.toBeInTheDocument();
      expect(screen.getByText(/Rebooted: 5/)).toBeInTheDocument();
    });

    it("renders nothing when payload is empty", () => {
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
      renderChart(
        [
          {
            date: "Dec 16",
            unreachable: 1,
            rebooted: 1,
            unassigned: 1,
            usbUnplugged: 1,
            usbPlugged: 1,
            onboarded: 1,
            planAssigned: 1,
          },
        ],
        0
      );
      expect(screen.getByTestId("area-chart")).toHaveAttribute(
        "data-points",
        "1"
      );
    });

    it("renders all areas even when all values are 0", () => {
      renderChart(
        [
          {
            date: "Dec 16",
            unreachable: 0,
            rebooted: 0,
            unassigned: 0,
            usbUnplugged: 0,
            usbPlugged: 0,
            onboarded: 0,
            planAssigned: 0,
          },
        ],
        0
      );
      ALL_KEYS.forEach((key) =>
        expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument()
      );
    });
  });
});
