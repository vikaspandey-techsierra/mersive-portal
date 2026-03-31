import { timeseriesMock } from "../mock/timeseriesMock";
import { parseTimeseries } from "./timeseriesParser";
import { setMetric, getMetric } from "../utils/metricsStore";
import { TimeseriesRow } from "./timeseriesTypes";

const pendingMetrics: Record<string, Set<string>> = {};

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 120,
};

export function getLatestMockDate(): Date {
  const dates = timeseriesMock.map((r) => new Date(r.date).getTime());
  return new Date(Math.max(...dates));
}

export function getStartDate(timeRange: string): string {
  const days = RANGE_DAYS[timeRange] ?? 7;
  const end = new Date();

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return start.toISOString().split("T")[0];
}

export function getEndDate(): string {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  return end.toISOString().split("T")[0];
}

export function getAggregationLevel(timeRange: string): "day" | "week" {
  if (timeRange === "7d" || timeRange === "30d") return "day";
  return "week";
}

export async function fetchTimeseriesMetrics(
  orgId: string,
  metrics: string[] | string,
  timeRange: string = "7d"
): Promise<void> {
  if (!pendingMetrics[timeRange]) {
    pendingMetrics[timeRange] = new Set();
  }

  const metricsArray =
    typeof metrics === "string"
      ? metrics.split(",").map((m) => m.trim())
      : metrics;

  metricsArray.forEach((m) => pendingMetrics[timeRange].add(m));

  await new Promise((resolve) => setTimeout(resolve, 0));

  console.log("Fetching metrics for org:", orgId, "range:", timeRange);
  console.log("Requested metrics:", metricsArray);
  const allMetrics = Array.from(pendingMetrics[timeRange]);
  pendingMetrics[timeRange].clear();

  const startDate = getStartDate(timeRange);
  const endDate = getEndDate();

  let expandedMetrics: string[] = [];

  // Handle alert metrics
  if (allMetrics.includes("ts_app_alerts_*")) {
    const alertRows = timeseriesMock.filter(
      (row) =>
        row.org_id === orgId &&
        row.metric_name.startsWith("ts_app_alerts_") &&
        row.date >= startDate &&
        row.date <= endDate
    );

    const alertMetricSet = new Set<string>();
    alertRows.forEach((row) => alertMetricSet.add(row.metric_name));

    expandedMetrics = [
      ...allMetrics.filter((m) => m !== "ts_app_alerts_*"),
      ...Array.from(alertMetricSet),
    ];
  } else {
    expandedMetrics = allMetrics;
  }

  const missingMetrics = expandedMetrics.filter(
    (metric) => !getMetric(orgId, metric, timeRange)
  );

  if (!missingMetrics.length) return;

  const rows: TimeseriesRow[] = timeseriesMock.filter(
    (row) =>
      row.org_id === orgId &&
      missingMetrics.includes(row.metric_name) &&
      row.date >= startDate &&
      row.date <= endDate
  );

  console.log("=====", metrics);
  console.log("Fetching data for org:", orgId);
  console.log("Rows after org filter:", rows.length);

  const orgRows = rows.filter((r) => r.org_id === orgId);

  console.log("ORG FILTER DEBUG");
  console.log("Selected org:", orgId);
  console.log(
    "Rows for this org:",
    orgRows.map((r) => ({
      org: r.org_id,
      metric: r.metric_name,
      value: r.metric_value,
      date: r.date,
    }))
  );

  //Parse per metric (prevents metric data mixing)
  missingMetrics.forEach((metric) => {
    const metricRows = orgRows.filter((r) => r.metric_name === metric);

    console.log(
      "Metric debug:",
      metric,
      metricRows.map((r) => r.metric_value)
    );

    const parsed = parseTimeseries(metricRows, timeRange, new Date(), [metric]);

    const data = parsed[metric];
    if (data) {
      setMetric(orgId, metric, timeRange, data);
    }
  });
}
