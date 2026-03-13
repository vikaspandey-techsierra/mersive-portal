import { timeseriesMock } from "../mock/timeseriesMock";
import { parseTimeseries } from "./timeseriesParser";
import { setMetric, getMetric } from "../utils/metricsStore";
import { TimeseriesRow } from "./timeseriesTypes";

const RANGE_DAYS: Record<string, number> = {
  "7d":  7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  "all": 120,
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
  if (!metrics.length) return;

  const missingMetrics = metrics.filter(
    (metric) => !getMetric(`${metric}__${timeRange}`)
  );

  console.log("Metrics requested:", metrics, "| Range:", timeRange);
  console.log("Missing (will fetch):", missingMetrics);

  if (!missingMetrics.length) {
    console.log("All metrics cached for range:", timeRange);
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  // Production: replace with real API call
  // const rows: TimeseriesRow[] = await fetch("/api/timeseries", {
  //   method: "POST",
  //   body: JSON.stringify({ metrics: missingMetrics, timeRange, aggregation_level: "Day" })
  // }).then(r => r.json())

  const startDate = getStartDate(timeRange);

  const rows: TimeseriesRow[] = timeseriesMock.filter(
    (row) =>
      missingMetrics.includes(row.metric_name) &&
      row.date >= startDate
  );

  console.log("Rows from mock/API:", rows.length, "| Start date:", startDate);

  const parsed = parseTimeseries(rows, timeRange, getReferenceDate(), missingMetrics);

  console.log("Parsed metrics:", Object.keys(parsed));

  missingMetrics.forEach((metric) => {
    const data = parsed[metric];
    if (data) {
      console.log("Storing:", `${metric}__${timeRange}`, `(${data.length} points)`);
      setMetric(`${metric}__${timeRange}`, data);
    }
  });
}