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
  const end = getLatestMockDate();

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  return start.toISOString().split("T")[0];
}

export function getEndDate(): string {
  const end = getLatestMockDate();
  end.setHours(0, 0, 0, 0);
  return end.toISOString().split("T")[0];
}

export function getAggregationLevel(timeRange: string): "day" | "week" {
  if (timeRange === "7d" || timeRange === "30d") return "day";
  return "week";
}

export async function fetchTimeseriesMetrics(
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

  // batching delay
  await new Promise((resolve) => setTimeout(resolve, 0));

  const allMetrics = Array.from(pendingMetrics[timeRange]);
  pendingMetrics[timeRange].clear();

  const missingMetrics = allMetrics.filter(
    (metric) => !getMetric(`${metric}__${timeRange}`)
  );

  if (!missingMetrics.length) return;

  //BUILD API PARAMS
  const metricsString = missingMetrics.join(",");
  const startDate = getStartDate(timeRange);
  const endDate = getEndDate();
  const aggregationLevel = getAggregationLevel(timeRange);

  console.log("BATCH Metrics:", missingMetrics);
  console.log("Metrics (string):", metricsString);
  console.log("start_date:", startDate);
  console.log("end_date:", endDate);
  console.log("aggregation_level:", aggregationLevel);

  //MOCK FILTER (simulate API)
  const rows: TimeseriesRow[] = timeseriesMock.filter(
    (row) =>
      missingMetrics.includes(row.metric_name) &&
      row.date >= startDate &&
      row.date <= endDate
  );

  // console.log("Rows fetched:", rows.length);

  //PARSE
  const parsed = parseTimeseries(
    rows,
    timeRange,
    getLatestMockDate(),
    missingMetrics
  );

  // console.log("Parsed result:", parsed);

  // CACHE
  missingMetrics.forEach((metric) => {
    const data = parsed[metric];
    if (data) {
      setMetric(`${metric}__${timeRange}`, data);
    }
  });
}