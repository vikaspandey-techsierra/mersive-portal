import {
  calculateMetric,
  METRIC_DEPENDENCIES,
} from "@/lib/analytics/utils/metricsResolver";
import { METRIC_FORMULAS } from "@/lib/analytics/utils/metricsDerived";
import { timeseriesMock } from "@/lib/analytics/mock/timeseriesMock";

// ─── Helper: Convert API mock → metric format ────────────────────────────────

function mapMetric(mock: any[], metricName: string) {
  return mock
    .filter((row) => row.metric_name === metricName)
    .map((row) => ({
      date: row.date,
      value: Number(row.metric_value),
    }));
}

// ─── Controlled test data (unit testing) ─────────────────────────────────────

const meetings = [
  { date: "2026-01-01", value: 4 },
  { date: "2026-01-02", value: 2 },
  { date: "2026-01-03", value: 0 },
  { date: "2026-01-04", value: 5 },
];

const hours = [
  { date: "2026-01-01", value: 8 },
  { date: "2026-01-02", value: 3 },
  { date: "2026-01-03", value: 0 },
  { date: "2026-01-04", value: 10 },
];

const connections = [
  { date: "2026-01-01", value: 20 },
  { date: "2026-01-02", value: 6 },
  { date: "2026-01-03", value: 0 },
  { date: "2026-01-04", value: 15 },
];

const posts = [
  { date: "2026-01-01", value: 12 },
  { date: "2026-01-02", value: 4 },
  { date: "2026-01-03", value: 0 },
  { date: "2026-01-04", value: 10 },
];

// ─── ts_meetings_duration_avg ───────────────────────────────────────────────

describe("ts_meetings_duration_avg", () => {
  const metrics = {
    ts_meetings_num: meetings,
    ts_meetings_duration_tot: hours,
  };

  it("calculates avg duration correctly", () => {
    const result = calculateMetric("ts_meetings_duration_avg", metrics)!;
    expect(result[0].value).toBeCloseTo(2);
    expect(result[1].value).toBeCloseTo(1.5);
    expect(result[2].value).toBe(0);
  });

  it("returns [] when dependencies missing", () => {
    const result = calculateMetric("ts_meetings_duration_avg", {});
    expect(result).toEqual([]);
  });
});

// ─── ts_meetings_connection_avg ─────────────────────────────────────────────

describe("ts_meetings_connection_avg", () => {
  const metrics = {
    ts_meetings_num: meetings,
    ts_connections_num: connections,
  };

  it("calculates avg connections correctly", () => {
    const result = calculateMetric("ts_meetings_connection_avg", metrics)!;
    expect(result[0].value).toBeCloseTo(5);
    expect(result[2].value).toBe(0);
  });
});

// ─── ts_meetings_post_avg ───────────────────────────────────────────────────

describe("ts_meetings_post_avg", () => {
  const metrics = {
    ts_meetings_num: meetings,
    ts_posts_num: posts,
  };

  it("calculates avg posts correctly", () => {
    const result = calculateMetric("ts_meetings_post_avg", metrics)!;
    expect(result[0].value).toBeCloseTo(3);
    expect(result[2].value).toBe(0);
  });
});

// ─── REAL MOCK DATA TESTS (IMPORTANT) ───────────────────────────────────────

describe("Real data tests using timeseriesMock", () => {
  it("calculates avg duration with real API data", () => {
    const metrics = {
      ts_meetings_num: mapMetric(timeseriesMock, "ts_meetings_num"),
      ts_meetings_duration_tot: mapMetric(
        timeseriesMock,
        "ts_meetings_duration_tot"
      ),
    };

    const result = calculateMetric("ts_meetings_duration_avg", metrics)!;

    expect(result.length).toBeGreaterThan(0);

    result.forEach((point) => {
      expect(typeof point.value).toBe("number");
      expect(isFinite(point.value)).toBe(true);
    });
  });

  it("calculates avg connections with real data", () => {
    const metrics = {
      ts_meetings_num: mapMetric(timeseriesMock, "ts_meetings_num"),
      ts_connections_num: mapMetric(timeseriesMock, "ts_connections_num"),
    };

    const result = calculateMetric("ts_meetings_connection_avg", metrics)!;

    expect(result.length).toBeGreaterThan(0);
  });

  it("handles duplicate dates without crashing", () => {
    const metrics = {
      ts_meetings_num: mapMetric(timeseriesMock, "ts_meetings_num"),
      ts_connections_num: mapMetric(timeseriesMock, "ts_connections_num"),
    };

    const result = calculateMetric("ts_meetings_connection_avg", metrics)!;

    expect(result).toBeDefined();
  });
});

// ─── calculateMetric general ────────────────────────────────────────────────

describe("calculateMetric — general", () => {
  it("returns null for unknown metric", () => {
    const result = calculateMetric("invalid_metric", {});
    expect(result).toBeNull();
  });

  it("all values are finite numbers", () => {
    const metrics = {
      ts_meetings_num: meetings,
      ts_meetings_duration_tot: hours,
    };

    const result = calculateMetric("ts_meetings_duration_avg", metrics)!;

    result.forEach((p) => {
      expect(isFinite(p.value)).toBe(true);
    });
  });
});

// ─── METRIC_DEPENDENCIES ────────────────────────────────────────────────────

describe("METRIC_DEPENDENCIES", () => {
  it("has dependencies defined for all formulas", () => {
    Object.keys(METRIC_FORMULAS).forEach((metric) => {
      expect(METRIC_DEPENDENCIES[metric]).toBeDefined();
    });
  });
});
