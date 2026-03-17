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

export function getReferenceDate(): Date {
  return getLatestMockDate();
}

export function getStartDate(timeRange: string): string {
  const days = RANGE_DAYS[timeRange] ?? 7;
  const ref = getLatestMockDate();
  ref.setDate(ref.getDate() - (days - 1));
  ref.setHours(0, 0, 0, 0);
  return ref.toISOString().split("T")[0];
}

export async function fetchTimeseriesMetrics(
  metrics: string[] | string,
  timeRange: string = "7d"
): Promise<void> {

  if (!pendingMetrics[timeRange]) {
    pendingMetrics[timeRange] = new Set();
  }

  //normalize input (string | string[])
  const metricsArray =
    typeof metrics === "string"
      ? metrics.split(",").map((m) => m.trim())
      : metrics;

  // add to batch queue
  metricsArray.forEach((m) => pendingMetrics[timeRange].add(m));

  //batching delay
  await new Promise((resolve) => setTimeout(resolve, 0));

  const allMetrics = Array.from(pendingMetrics[timeRange]);
  pendingMetrics[timeRange].clear();

  //only fetch missing
  const missingMetrics = allMetrics.filter(
    (metric) => !getMetric(`${metric}__${timeRange}`)
  );

  if (!missingMetrics.length) return;

  console.log("BATCH Metrics:", missingMetrics);

  //API string (for real backend)
  const metricsString = missingMetrics.join(",");
  console.log("Metrics (string):", metricsString);

  const startDate = getStartDate(timeRange);

  // USE missingMetrics directly (NO re-split bug)
  const rows: TimeseriesRow[] = timeseriesMock.filter(
    (row) =>
      missingMetrics.includes(row.metric_name) &&
      row.date >= startDate
  );

  const parsed = parseTimeseries(
    rows,
    timeRange,
    getReferenceDate(),
    missingMetrics
  );

  // cache result
  missingMetrics.forEach((metric) => {
    const data = parsed[metric];
    if (data) {
      setMetric(`${metric}__${timeRange}`, data);
    }
  });

  console.log("BATCH Metrics:", missingMetrics);
  console.log("Metrics string:", metricsString);
  console.log("Rows fetched:", rows.length);  
  console.log("Parsed result:", parsed);
}