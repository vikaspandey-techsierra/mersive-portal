import { ChartPoint, MetricsStore } from "../timeseries/timeseriesTypes";

const metricsStore: MetricsStore = {};

export function setMetric(key: string, data: ChartPoint[]): void {
  console.log("Cache SET:", key);
  metricsStore[key] = data;
}

export function getMetric(key: string): ChartPoint[] | null {
  const data = metricsStore[key];
  console.log(data ? "Cache HIT:" : "Cache MISS:", key);
  return data ?? null;
}

export function hasMetric(key: string): boolean {
  return key in metricsStore && metricsStore[key] !== null;
}

export function getAllMetrics(): MetricsStore {
  return metricsStore;
}

export function clearMetricsByRange(timeRange: string): void {
  Object.keys(metricsStore).forEach((key) => {
    if (key.endsWith(`__${timeRange}`)) {
      delete metricsStore[key];
    }
  });
}

export function clearMetrics(): void {
  Object.keys(metricsStore).forEach((key) => delete metricsStore[key]);
}