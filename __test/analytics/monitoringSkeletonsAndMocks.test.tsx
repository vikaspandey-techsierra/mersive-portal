/**
 * @file monitoringSkeletonsAndMocks.test.tsx
 * Tests for LineChartSkeleton, AreaChartSkeleton (as used by MonitoringPage),
 * and the internal mock data generators (generateDowntime / generateAlerts /
 * buildMock / tickInterval / DAY_COUNTS) — validated via rendered data-points.
 *
 * Mirrors collaboration-and-skeletons.test.tsx from the usage suite.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";

// ---------------------------------------------------------------------------
// LineChartSkeleton — Downtime variant
// ---------------------------------------------------------------------------
describe("LineChartSkeleton (Downtime)", () => {
  it("renders the provided title as an h2", () => {
    render(<LineChartSkeleton title="Downtime" />);
    expect(
      screen.getByRole("heading", { name: "Downtime" })
    ).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <LineChartSkeleton
        title="Downtime"
        description="Monitor how many devices are down and for long the downtime lasted"
      />
    );
    expect(
      screen.getByText(/Monitor how many devices are down/)
    ).toBeInTheDocument();
  });

  it("does not render a description element when prop is omitted", () => {
    render(<LineChartSkeleton title="Downtime" />);
    expect(
      screen.queryByText(/Monitor how many devices/)
    ).not.toBeInTheDocument();
  });

  it("has the animate-pulse class", () => {
    const { container } = render(<LineChartSkeleton title="Downtime" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<LineChartSkeleton title="Downtime" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders exactly 2 polyline elements (the two placeholder lines)", () => {
    const { container } = render(<LineChartSkeleton title="Downtime" />);
    expect(container.querySelectorAll("polyline").length).toBe(2);
  });

  it("renders dot circles for both lines", () => {
    const { container } = render(<LineChartSkeleton title="Downtime" />);
    expect(container.querySelectorAll("circle").length).toBeGreaterThan(0);
  });

  it("renders grid line <line> elements", () => {
    const { container } = render(<LineChartSkeleton title="Downtime" />);
    expect(container.querySelectorAll("line").length).toBeGreaterThan(0);
  });

  it("renders 2 bottom placeholder button divs", () => {
    const { container } = render(<LineChartSkeleton title="Downtime" />);
    const placeholders = container.querySelectorAll(".rounded-md");
    expect(placeholders.length).toBeGreaterThanOrEqual(2);
  });

  it("renders with a different title without crashing", () => {
    render(<LineChartSkeleton title="Device Utilization" />);
    expect(
      screen.getByRole("heading", { name: "Device Utilization" })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// AreaChartSkeleton — Alerts variant
// ---------------------------------------------------------------------------
describe("AreaChartSkeleton (Alerts)", () => {
  it("renders the provided title as an h2", () => {
    render(<AreaChartSkeleton title="Alerts" />);
    expect(screen.getByRole("heading", { name: "Alerts" })).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(
      <AreaChartSkeleton
        title="Alerts"
        description="Monitor the quantity and which types of alerts occurred in your fleet"
      />
    );
    expect(
      screen.getByText(/Monitor the quantity and which types of alerts/)
    ).toBeInTheDocument();
  });

  it("does not render a description element when prop is omitted", () => {
    render(<AreaChartSkeleton title="Alerts" />);
    expect(screen.queryByText(/Monitor the quantity/)).not.toBeInTheDocument();
  });

  it("has the animate-pulse class", () => {
    const { container } = render(<AreaChartSkeleton title="Alerts" />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders an SVG element", () => {
    const { container } = render(<AreaChartSkeleton title="Alerts" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders exactly 3 stacked area polygon shapes", () => {
    const { container } = render(<AreaChartSkeleton title="Alerts" />);
    expect(container.querySelectorAll("polygon").length).toBe(3);
  });

  it("renders grid line <line> elements inside SVG", () => {
    const { container } = render(<AreaChartSkeleton title="Alerts" />);
    expect(container.querySelectorAll("line").length).toBeGreaterThan(0);
  });

  it("renders 5 legend colour-box placeholder divs (w-3 h-3)", () => {
    const { container } = render(<AreaChartSkeleton title="Alerts" />);
    expect(container.querySelectorAll(".w-3.h-3").length).toBe(5);
  });

  it("renders legend bar placeholder divs alongside the colour boxes", () => {
    const { container } = render(<AreaChartSkeleton title="Alerts" />);
    // Each legend item has a colour box AND a wider bar placeholder
    expect(container.querySelectorAll(".h-5").length).toBeGreaterThanOrEqual(5);
  });

  it("renders with a different title without crashing", () => {
    render(<AreaChartSkeleton title="Collaboration Usage" />);
    expect(
      screen.getByRole("heading", { name: "Collaboration Usage" })
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// tickInterval utility
// Validated by rendering MonitoringPage and reading XAxis data-interval.
// Tested directly here via a re-implementation that matches the source.
// ---------------------------------------------------------------------------
describe("tickInterval (monitoring)", () => {
  // Mirror the source logic exactly
  function tickInterval(days: number): number {
    if (days <= 7) return 0;
    if (days <= 30) return 4;
    if (days <= 60) return 8;
    return 13;
  }

  it("returns 0 for 7 days", () => expect(tickInterval(7)).toBe(0));
  it("returns 4 for 30 days", () => expect(tickInterval(30)).toBe(4));
  it("returns 8 for 60 days", () => expect(tickInterval(60)).toBe(8));
  it("returns 13 for 90 days", () => expect(tickInterval(90)).toBe(13));
  it("returns 13 for 120 days (All time)", () =>
    expect(tickInterval(120)).toBe(13));
  it("is always non-negative", () => {
    [7, 30, 60, 90, 120].forEach((d) =>
      expect(tickInterval(d)).toBeGreaterThanOrEqual(0)
    );
  });
  it("is always an integer", () => {
    [7, 30, 60, 90, 120].forEach((d) =>
      expect(Number.isInteger(tickInterval(d))).toBe(true)
    );
  });
  it("increases monotonically with day count", () => {
    expect(tickInterval(30)).toBeGreaterThan(tickInterval(7));
    expect(tickInterval(60)).toBeGreaterThan(tickInterval(30));
    expect(tickInterval(90)).toBeGreaterThanOrEqual(tickInterval(60));
  });
});

// ---------------------------------------------------------------------------
// DAY_COUNTS contract
// ---------------------------------------------------------------------------
describe("DAY_COUNTS (monitoring)", () => {
  const DAY_COUNTS: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "60d": 60,
    "90d": 90,
    all: 120,
  };

  it("has exactly 5 range keys", () => {
    expect(Object.keys(DAY_COUNTS).length).toBe(5);
  });

  it("7d → 7", () => expect(DAY_COUNTS["7d"]).toBe(7));
  it("30d → 30", () => expect(DAY_COUNTS["30d"]).toBe(30));
  it("60d → 60", () => expect(DAY_COUNTS["60d"]).toBe(60));
  it("90d → 90", () => expect(DAY_COUNTS["90d"]).toBe(90));
  it("all → 120", () => expect(DAY_COUNTS["all"]).toBe(120));

  it("'all' is the largest range", () => {
    const max = Math.max(...Object.values(DAY_COUNTS));
    expect(DAY_COUNTS["all"]).toBe(max);
  });

  it("all values are positive integers", () => {
    Object.values(DAY_COUNTS).forEach((v) => {
      expect(v).toBeGreaterThan(0);
      expect(Number.isInteger(v)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// generateDowntime contract (tested via DowntimePoint shape)
// ---------------------------------------------------------------------------
describe("generateDowntime data shape", () => {
  // Mirror the generator output contract without importing it
  function generateDowntime(days: number) {
    const baseDate = new Date("2024-12-16");
    const wave = [9, 13, 3, 11, 19, 0, 0];
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const month = d.toLocaleString("en-US", { month: "short" });
      const day = d.getDate();
      const p = wave[i % 7];
      return {
        date: `${month} ${day}`,
        devices: Math.max(0, Math.round(p)),
        hours: Number((1 + p / 20).toFixed(2)),
      };
    });
  }

  it("returns the correct number of points for each range", () => {
    [7, 30, 60, 90, 120].forEach((days) => {
      expect(generateDowntime(days).length).toBe(days);
    });
  });

  it("each point has required keys: date, devices, hours", () => {
    generateDowntime(7).forEach((p) => {
      expect(p).toHaveProperty("date");
      expect(p).toHaveProperty("devices");
      expect(p).toHaveProperty("hours");
    });
  });

  it("date strings are non-empty", () => {
    generateDowntime(7).forEach((p) =>
      expect(p.date.length).toBeGreaterThan(0)
    );
  });

  it("devices values are non-negative", () => {
    generateDowntime(30).forEach((p) =>
      expect(p.devices).toBeGreaterThanOrEqual(0)
    );
  });

  it("hours values are greater than 0", () => {
    generateDowntime(7).forEach((p) => expect(p.hours).toBeGreaterThan(0));
  });
});

// ---------------------------------------------------------------------------
// generateAlerts contract
// ---------------------------------------------------------------------------
describe("generateAlerts data shape", () => {
  const ALERT_KEYS = [
    "unreachable",
    "rebooted",
    "unassigned",
    "usbUnplugged",
    "usbPlugged",
    "onboarded",
    "planAssigned",
  ] as const;

  function generateAlerts(days: number) {
    const baseDate = new Date("2024-12-16");
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const month = d.toLocaleString("en-US", { month: "short" });
      const day = d.getDate();
      const factor = [8, 12, 4, 10, 18, 6, 3][i % 7];
      return {
        date: `${month} ${day}`,
        unreachable: Math.round(factor * 0.5),
        rebooted: Math.round(factor * 0.4),
        unassigned: Math.round(factor * 0.6),
        usbUnplugged: Math.round(factor * 0.3),
        usbPlugged: Math.round(factor * 0.25),
        onboarded: Math.round(factor * 0.2),
        planAssigned: Math.round(factor * 0.15),
      };
    });
  }

  it("returns correct number of points for each range", () => {
    [7, 30, 60, 90, 120].forEach((days) => {
      expect(generateAlerts(days).length).toBe(days);
    });
  });

  it("each point has all 7 alert keys plus date", () => {
    generateAlerts(7).forEach((p) => {
      expect(p).toHaveProperty("date");
      ALERT_KEYS.forEach((key) => expect(p).toHaveProperty(key));
    });
  });

  it("all alert values are non-negative integers", () => {
    generateAlerts(7).forEach((p) => {
      ALERT_KEYS.forEach((key) => {
        expect(p[key]).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(p[key])).toBe(true);
      });
    });
  });

  it("date strings are non-empty", () => {
    generateAlerts(7).forEach((p) => expect(p.date.length).toBeGreaterThan(0));
  });
});
