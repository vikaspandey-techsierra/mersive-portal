/**
 * AlertGraph.test.tsx
 *
 * Tests for AlerthistoryGraph (exported as default from AlertGraph.tsx).
 * Covers: time range buttons, series rendering, toggle on/off,
 * tooltip rendering, loading overlay, XAxis tick interval,
 * and edge cases (empty data, single point).
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";

// ─── Mock MOCK_ALERT_HISTORY ──────────────────────────────────────────────────
// jest.mock is hoisted before const declarations, so MOCK_HISTORY must be
// built entirely inside the factory. We expose it via a module-scope let
// assigned after the import so edge-case tests can mutate it.

function makePoints(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, "0")}`,
    unreachable: i + 1,
    rebooted: i + 2,
    unassignedFromTemplate: i + 3,
    updateAvailable: i + 4,
    updateCompleted: i + 5,
  }));
}

// This object is shared between the mock factory and the tests.
// Declare it with `var` (hoisted) so it's accessible inside jest.mock factory.
// eslint-disable-next-line no-var
var MOCK_HISTORY: Record<string, ReturnType<typeof makePoints>> = {
  "7d": makePoints(7),
  "30d": makePoints(30),
  "60d": makePoints(60),
  "90d": makePoints(90),
  all: makePoints(120),
};

jest.mock("@/lib/alertHistoryMock", () => ({
  // Return a getter so mutations to MOCK_HISTORY propagate
  get MOCK_ALERT_HISTORY() {
    return MOCK_HISTORY;
  },
}));

// ─── Module-level tooltip flags ───────────────────────────────────────────────

let __tooltipActive = false;
let __tooltipPayload: { name: string; value: number; color: string }[] = [];
let __tooltipLabel = "";

// ─── Mock recharts ────────────────────────────────────────────────────────────

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
      data?: unknown[];
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
      name: string;
    }) => (
      <div data-testid={`area-${dataKey}`} data-fill={fill} data-name={name} />
    ),
    XAxis: ({ interval }: { interval?: number }) => (
      <div data-testid="x-axis" data-interval={interval} />
    ),
    YAxis: () => <div data-testid="y-axis" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    Tooltip: ({
      content,
    }: {
      content: React.ReactElement | ((props: unknown) => React.ReactNode);
    }) => {
      if (!__tooltipActive) return <div data-testid="tooltip-inactive" />;
      const payload = __tooltipPayload;
      const label = __tooltipLabel;
      if (typeof content === "function") {
        return (
          <div data-testid="tooltip-active">
            {content({ active: true, payload, label })}
          </div>
        );
      }
      const ContentFn = (content as React.ReactElement)
        .type as React.ComponentType<{
        active?: boolean;
        payload?: typeof payload;
        label?: string;
      }>;
      return (
        <div data-testid="tooltip-active">
          <ContentFn active payload={payload} label={label} />
        </div>
      );
    },
  };
});

// ─── Import after mocks ───────────────────────────────────────────────────────

import AlertGraph from "@/components/AlertGraph";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderGraph(props = {}) {
  return render(<AlertGraph {...props} />);
}

async function waitForData() {
  // fetchAlertHistory has a 300ms simulated delay
  await act(async () => {
    jest.advanceTimersByTime(400);
  });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useFakeTimers();
  __tooltipActive = false;
  __tooltipPayload = [];
  __tooltipLabel = "";
});

afterEach(async () => {
  await act(async () => {
    jest.runAllTimers();
  });
  jest.useRealTimers();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("AlertGraph — heading and description", () => {
  it("renders 'Alert History' heading", async () => {
    renderGraph();
    await waitForData();
    expect(screen.getByText("Alert History")).toBeInTheDocument();
  });

  it("renders description text", async () => {
    renderGraph();
    await waitForData();
    expect(
      screen.getByText(
        /View the quantity and which types of alerts were emailed/i
      )
    ).toBeInTheDocument();
  });
});

describe("AlertGraph — time range buttons", () => {
  it("renders all 5 time range buttons", async () => {
    renderGraph();
    await waitForData();
    expect(
      screen.getByRole("button", { name: /last 7 days/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /last 30 days/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /last 60 days/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /last 90 days/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /all time/i })
    ).toBeInTheDocument();
  });

  it("'Last 7 days' is active by default", async () => {
    renderGraph();
    await waitForData();
    const btn = screen.getByRole("button", { name: /last 7 days/i });
    expect(btn.className).toMatch(/bg-\[#6860C8\]/);
  });

  it("switches active button when a different range is clicked", async () => {
    renderGraph();
    await waitForData();
    fireEvent.click(screen.getByRole("button", { name: /last 30 days/i }));
    await waitForData();
    expect(
      screen.getByRole("button", { name: /last 30 days/i }).className
    ).toMatch(/bg-\[#6860C8\]/);
    expect(
      screen.getByRole("button", { name: /last 7 days/i }).className
    ).not.toMatch(/bg-\[#6860C8\]/);
  });

  it.each([
    ["7d", 7],
    ["30d", 30],
    ["60d", 60],
    ["90d", 90],
    ["all", 120],
  ] as [string, number][])(
    "range %s loads %d data points",
    async (rangeId, count) => {
      renderGraph();
      await waitForData();
      const labels: Record<string, string> = {
        "7d": "Last 7 days",
        "30d": "Last 30 days",
        "60d": "Last 60 days",
        "90d": "Last 90 days",
        all: "All time",
      };
      fireEvent.click(screen.getByRole("button", { name: labels[rangeId] }));
      await waitForData();
      expect(screen.getByTestId("area-chart")).toHaveAttribute(
        "data-points",
        String(count)
      );
    }
  );
});

describe("AlertGraph — loading overlay", () => {
  it("shows loading overlay before data arrives", () => {
    renderGraph();
    // loading state — before 300ms delay
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("hides loading overlay after data arrives", async () => {
    renderGraph();
    await waitForData();
    const spinners = document.querySelectorAll(".animate-spin");
    expect(spinners.length).toBe(0);
  });
});

describe("AlertGraph — series (Areas)", () => {
  const SERIES = [
    { key: "unreachable", color: "#6860C8" },
    { key: "rebooted", color: "#D44E80" },
    { key: "unassignedFromTemplate", color: "#4D9EC4" },
    { key: "updateAvailable", color: "#7E9E2E" },
    { key: "updateCompleted", color: "#E8902A" },
  ];

  it("renders all 5 Area components", async () => {
    renderGraph();
    await waitForData();
    SERIES.forEach(({ key }) => {
      expect(screen.getByTestId(`area-${key}`)).toBeInTheDocument();
    });
  });

  it("each Area has correct fill colour", async () => {
    renderGraph();
    await waitForData();
    SERIES.forEach(({ key, color }) => {
      expect(screen.getByTestId(`area-${key}`)).toHaveAttribute(
        "data-fill",
        color
      );
    });
  });

  it("each Area has correct name prop", async () => {
    renderGraph();
    await waitForData();
    const NAMES: Record<string, string> = {
      unreachable: "Unreachable",
      rebooted: "Rebooted",
      unassignedFromTemplate: "Unassigned from template",
      updateAvailable: "Update available",
      updateCompleted: "Update completed",
    };
    SERIES.forEach(({ key }) => {
      expect(screen.getByTestId(`area-${key}`)).toHaveAttribute(
        "data-name",
        NAMES[key]
      );
    });
  });
});

describe("AlertGraph — legend toggles", () => {
  const LABELS = [
    "Unreachable",
    "Rebooted",
    "Unassigned from template",
    "Update available",
    "Update completed",
  ];

  it("renders all 5 legend labels", async () => {
    renderGraph();
    await waitForData();
    LABELS.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("all legend checkboxes are checked by default", async () => {
    renderGraph();
    await waitForData();
    // Each checked checkbox renders a checkmark SVG path
    const checkmarks = document.querySelectorAll(
      'svg path[d="M1 4L3.5 6.5L9 1"]'
    );
    expect(checkmarks.length).toBe(5);
  });

  it("toggling a series off removes its checkmark", async () => {
    renderGraph();
    await waitForData();
    // Click the "Unreachable" legend item
    fireEvent.click(screen.getByText("Unreachable"));
    const checkmarks = document.querySelectorAll(
      'svg path[d="M1 4L3.5 6.5L9 1"]'
    );
    expect(checkmarks.length).toBe(4);
  });

  it("toggling a series off then on restores checkmark", async () => {
    renderGraph();
    await waitForData();
    fireEvent.click(screen.getByText("Unreachable"));
    fireEvent.click(screen.getByText("Unreachable"));
    const checkmarks = document.querySelectorAll(
      'svg path[d="M1 4L3.5 6.5L9 1"]'
    );
    expect(checkmarks.length).toBe(5);
  });

  it("toggling all series off leaves 0 checkmarks", async () => {
    renderGraph();
    await waitForData();
    LABELS.forEach((label) => fireEvent.click(screen.getByText(label)));
    const checkmarks = document.querySelectorAll(
      'svg path[d="M1 4L3.5 6.5L9 1"]'
    );
    expect(checkmarks.length).toBe(0);
  });

  it("toggling multiple off independently works", async () => {
    renderGraph();
    await waitForData();
    fireEvent.click(screen.getByText("Rebooted"));
    fireEvent.click(screen.getByText("Update available"));
    const checkmarks = document.querySelectorAll(
      'svg path[d="M1 4L3.5 6.5L9 1"]'
    );
    expect(checkmarks.length).toBe(3);
  });
});

describe("AlertGraph — XAxis tick interval", () => {
  it("interval is 0 for 7d (7 points)", async () => {
    renderGraph();
    await waitForData();
    expect(screen.getByTestId("x-axis")).toHaveAttribute("data-interval", "0");
  });

  it("interval is 4 for 30d (30 points)", async () => {
    renderGraph();
    await waitForData();
    fireEvent.click(screen.getByRole("button", { name: /last 30 days/i }));
    await waitForData();
    expect(screen.getByTestId("x-axis")).toHaveAttribute("data-interval", "4");
  });

  it("interval is 9 for 60d (60 points)", async () => {
    renderGraph();
    await waitForData();
    fireEvent.click(screen.getByRole("button", { name: /last 60 days/i }));
    await waitForData();
    expect(screen.getByTestId("x-axis")).toHaveAttribute("data-interval", "9");
  });

  it("interval is 14 for 90d+ (90 points)", async () => {
    renderGraph();
    await waitForData();
    fireEvent.click(screen.getByRole("button", { name: /last 90 days/i }));
    await waitForData();
    expect(screen.getByTestId("x-axis")).toHaveAttribute("data-interval", "14");
  });

  it("interval is 14 for all time (120 points)", async () => {
    renderGraph();
    await waitForData();
    fireEvent.click(screen.getByRole("button", { name: /all time/i }));
    await waitForData();
    expect(screen.getByTestId("x-axis")).toHaveAttribute("data-interval", "14");
  });

  it("interval is a non-negative integer", async () => {
    renderGraph();
    await waitForData();
    const raw = screen.getByTestId("x-axis").getAttribute("data-interval");
    const n = Number(raw);
    expect(Number.isInteger(n)).toBe(true);
    expect(n).toBeGreaterThanOrEqual(0);
  });
});

describe("AlertGraph — tooltip", () => {
  it("renders nothing when tooltip is inactive", async () => {
    renderGraph();
    await waitForData();
    expect(screen.getByTestId("tooltip-inactive")).toBeInTheDocument();
    expect(screen.queryByTestId("tooltip-active")).not.toBeInTheDocument();
  });

  it("renders date label when tooltip is active", async () => {
    __tooltipActive = true;
    __tooltipLabel = "Jan 3";
    __tooltipPayload = [{ name: "Unreachable", value: 5, color: "#6860C8" }];
    renderGraph();
    await waitForData();
    expect(screen.getByText("Jan 3")).toBeInTheDocument();
  });

  it("renders series values in tooltip", async () => {
    __tooltipActive = true;
    __tooltipLabel = "Jan 3";
    __tooltipPayload = [
      { name: "Unreachable", value: 5, color: "#6860C8" },
      { name: "Rebooted", value: 3, color: "#D44E80" },
    ];
    renderGraph();
    await waitForData();
    // Scope to the tooltip container to avoid matching the legend labels
    const tooltip = screen.getByTestId("tooltip-active");
    expect(tooltip).toHaveTextContent("Unreachable");
    expect(tooltip).toHaveTextContent("Rebooted");
  });

  it("filters out series with value 0 in tooltip", async () => {
    __tooltipActive = true;
    __tooltipLabel = "Jan 1";
    __tooltipPayload = [
      { name: "Unreachable", value: 0, color: "#6860C8" },
      { name: "Rebooted", value: 4, color: "#D44E80" },
    ];
    renderGraph();
    await waitForData();
    // Scope to the tooltip container — "Unreachable" should not appear there
    const tooltip = screen.getByTestId("tooltip-active");
    expect(tooltip).not.toHaveTextContent("Unreachable");
    expect(tooltip).toHaveTextContent("Rebooted");
  });

  it("renders null when payload is empty", async () => {
    __tooltipActive = true;
    __tooltipLabel = "Jan 1";
    __tooltipPayload = [];
    renderGraph();
    await waitForData();
    // ChartTooltip returns null for empty payload
    expect(screen.queryByText("Jan 1")).not.toBeInTheDocument();
  });
});

describe("AlertGraph — CartesianGrid", () => {
  it("renders CartesianGrid", async () => {
    renderGraph();
    await waitForData();
    expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
  });
});

describe("AlertGraph — edge cases", () => {
  it("handles empty data gracefully (no crash)", async () => {
    MOCK_HISTORY["7d"] = [];
    renderGraph();
    await waitForData();
    expect(screen.getByTestId("area-chart")).toHaveAttribute(
      "data-points",
      "0"
    );
    // restore
    MOCK_HISTORY["7d"] = makePoints(7);
  });

  it("handles single data point", async () => {
    MOCK_HISTORY["7d"] = makePoints(1);
    renderGraph();
    await waitForData();
    expect(screen.getByTestId("area-chart")).toHaveAttribute(
      "data-points",
      "1"
    );
    MOCK_HISTORY["7d"] = makePoints(7);
  });
});
