import { ChartPoint, MetricsStore } from "../timeseries/timeseriesTypes";

const metricsStore: MetricsStore = {};

export function setMetric(
  orgId: string,
  metric: string,
  timeRange: string,
  data: ChartPoint[]
): void {
  const key = `${orgId}__${metric}__${timeRange}`;
  metricsStore[key] = data;
}

export function getMetric(
  orgId: string,
  metric: string,
  timeRange: string
): ChartPoint[] | null {
  const key = `${orgId}__${metric}__${timeRange}`;
  const data = metricsStore[key];
  return data ?? null;
}
export function hasMetric(
  orgId: string,
  metric: string,
  timeRange: string
): boolean {
  const key = `${orgId}__${metric}__${timeRange}`;
  return key in metricsStore;
}

export function getAllMetrics(): MetricsStore {
  return metricsStore;
}

export function clearMetricsByRange(orgId: string, timeRange: string): void {
  Object.keys(metricsStore).forEach((key) => {
    if (key.startsWith(`${orgId}__`) && key.endsWith(`__${timeRange}`)) {
      delete metricsStore[key];
    }
  });
}

export function clearMetricsByOrg(orgId: string): void {
  Object.keys(metricsStore).forEach((key) => {
    if (key.startsWith(`${orgId}__`)) {
      delete metricsStore[key];
    }
  });
}

export function clearMetrics(): void {
  Object.keys(metricsStore).forEach((key) => delete metricsStore[key]);
}
