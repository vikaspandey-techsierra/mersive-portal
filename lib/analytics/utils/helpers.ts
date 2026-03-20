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