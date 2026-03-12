// metricsManager is kept for tracking registered metrics (useful for debugging/future use)
// Fetching is handled directly in useTimeSeriesMetrics to avoid race conditions

const registeredMetrics = new Set<string>();

export function registerMetric(metric: string, timeRange: string = "7d") {
  registeredMetrics.add(`${metric}__${timeRange}`);
}

export function getRegisteredMetrics() {
  return Array.from(registeredMetrics);
}

export function clearRegisteredMetrics() {
  registeredMetrics.clear();
}