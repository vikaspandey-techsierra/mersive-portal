import { TimeseriesRow, ParsedMetricsMap } from "./timeseriesTypes";

const RANGE_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 120,
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
  const byMetric: Record<
    string,
    Record<string, Record<string, number> | number>
  > = {};

  //Track unique devices per day for downtime metric
  const downtimeDevicesPerDay: Record<string, Set<string>> = {};

  requestedMetrics.forEach((m) => {
    byMetric[m] = {};
  });

  data.forEach((row) => {
    const metric = row.metric_name;
    const date = row.date;
    const value = Number(row.metric_value);

    if (!byMetric[metric]) byMetric[metric] = {};

    const isSegmented = metric.includes("_by_");

    // SEGMENTED METRICS
    if (isSegmented) {
      if (!row.segment_1_value) return;

      const segment = row.segment_1_value;

      if (!byMetric[metric][date]) {
        byMetric[metric][date] = {};
      }

      const segmentMap = byMetric[metric][date] as Record<string, number>;
      segmentMap[segment] = (segmentMap[segment] ?? 0) + value;
    }
    // NON-SEGMENTED
    else {
      const existing = byMetric[metric][date] as number | undefined;
      byMetric[metric][date] = (existing ?? 0) + value;
    }

    //If downtime duration metric → track unique device_name
    if (metric === "ts_downtime_duration_tot" && row.device_name) {
      if (!downtimeDevicesPerDay[date]) {
        downtimeDevicesPerDay[date] = new Set();
      }
      downtimeDevicesPerDay[date].add(row.device_name);
    }
  });

  // console.log("Downtime devices per day:", downtimeDevicesPerDay);

  const allDates = generateDateRange(timeRange, referenceDate);
  const result: ParsedMetricsMap = {};

  Object.keys(byMetric).forEach((metric) => {
    result[metric] = [];

    allDates.forEach((date) => {
      const entry = byMetric[metric][date];

      if (!entry) {
        result[metric].push({
          date,
          value: 0,
        });
        return;
      }

      if (typeof entry === "object") {
        Object.entries(entry).forEach(([seg, value]) => {
          result[metric].push({
            date,
            value,
            segment: seg,
          });
        });
      } else {
        result[metric].push({
          date,
          value: entry,
        });
      }
    });
  });

  // Create ts_downtime_devices_num_tot metric
  if (requestedMetrics.includes("ts_downtime_devices_num_tot")) {
    result["ts_downtime_devices_num_tot"] = [];

    allDates.forEach((date) => {
      const count = downtimeDevicesPerDay[date]
        ? downtimeDevicesPerDay[date].size
        : 0;

      result["ts_downtime_devices_num_tot"].push({
        date,
        value: count,
      });
    });
  }

  return result;
}
