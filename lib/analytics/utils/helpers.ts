import { METRIC_DEPENDENCIES } from "./metricsResolver";

export function formatDate(dateString?: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

// Short date for chart x-axis labels
export function formatShortDate(dateString?: string): string {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isDerivedMetric(metric: string) {
  return metric in METRIC_DEPENDENCIES;
}

export function getDateCutoff(timeRange: string): Date | null {
  const now = new Date();
  const days: Record<string, number> = { "7d": 7, "30d": 30, "60d": 60, "90d": 90 };
  if (!days[timeRange]) return null; // "all"
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days[timeRange]);
  return cutoff;
}

export function rowInRange(dateStr: string, cutoff: Date | null): boolean {
  if (!cutoff) return true;
  return new Date(dateStr) >= cutoff;
}