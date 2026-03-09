import { ChartData } from "./snapshot/snapshotTypes";

const metricsStore: Record<string, ChartData[]> = {};

export function setMetricData(metric: string, data: ChartData[]) {
  metricsStore[metric] = data;
}

export function getMetricData(metric: string) {
  return metricsStore[metric] ?? [];
}