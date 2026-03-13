import { TimeseriesRow, ChartPoint, ParsedMetricsMap } from "./timeseriesTypes";

const RANGE_DAYS: Record<string, number> = {
  "7d":  7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  "all": 120,
};

function generateDateRange(timeRange: string, referenceDate: Date): string[] {
  const days = RANGE_DAYS[timeRange] ?? 7;
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export function parseTimeseries(
  data: TimeseriesRow[],
  timeRange: string = "7d",
  referenceDate: Date = new Date(),
  requestedMetrics: string[] = []
): ParsedMetricsMap {
  const byMetric: Record<string, Record<string, number>> = {};

  // Seed all requested metrics so they always get a full date array
  requestedMetrics.forEach((m) => {
    byMetric[m] = {};
  });

  // Group rows by metric -> date, summing values for segmented metrics
  data.forEach((row) => {
    const metric = row.metric_name;
    if (!byMetric[metric]) byMetric[metric] = {};
    byMetric[metric][row.date] =
      (byMetric[metric][row.date] ?? 0) + Number(row.metric_value);
  });

  const allDates = generateDateRange(timeRange, referenceDate);

  const result: ParsedMetricsMap = {};

  Object.keys(byMetric).forEach((metric) => {
    // Fill every date — 0 for missing so line stays at baseline
    result[metric] = allDates.map((date): ChartPoint => ({
      date,
      value: byMetric[metric][date] ?? 0,
    }));
  });

  return result;
}