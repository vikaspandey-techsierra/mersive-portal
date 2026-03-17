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
  return getLatestMockDate(); // swap for new Date() with real API
}

export function getStartDate(timeRange: string): string {
  const days = RANGE_DAYS[timeRange] ?? 7;
  const ref = getLatestMockDate();
  ref.setDate(ref.getDate() - (days - 1));
  ref.setHours(0, 0, 0, 0);
  return ref.toISOString().split("T")[0];
}

export async function fetchTimeseriesMetrics(
  metrics: string[],
  timeRange: string = "7d"
): Promise<void> {

  if (!pendingMetrics[timeRange]) {
    pendingMetrics[timeRange] = new Set();
  }

  //collect all metrics
  metrics.forEach((m) => pendingMetrics[timeRange].add(m));

  //debounce batching (wait for all calls)
  await new Promise((resolve) => setTimeout(resolve, 0));

  const allMetrics = Array.from(pendingMetrics[timeRange]);

  // clear queue
  pendingMetrics[timeRange].clear();

  const missingMetrics = allMetrics.filter(
    (metric) => !getMetric(`${metric}__${timeRange}`)
  );

  if (!missingMetrics.length) return;

  console.log("BATCH Metrics:", missingMetrics);

  const metricsString = missingMetrics.join(",");
  console.log("Metrics (string):", metricsString);

  const startDate = getStartDate(timeRange);

  const metricsArray = metricsString.split(",").map((m) => m.trim());

  const rows: TimeseriesRow[] = timeseriesMock.filter(
    (row) =>
      metricsArray.includes(row.metric_name) &&
      row.date >= startDate
  );

  const parsed = parseTimeseries(
    rows,
    timeRange,
    getReferenceDate(),
    missingMetrics
  );

  missingMetrics.forEach((metric) => {
    const data = parsed[metric];
    if (data) {
      setMetric(`${metric}__${timeRange}`, data);
    }
  });
}