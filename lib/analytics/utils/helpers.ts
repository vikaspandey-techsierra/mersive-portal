import { METRIC_DEPENDENCIES } from "./metricsResolver";
import { ChartPoint } from "../timeseries/timeseriesTypes";

export function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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
  if (!days[timeRange]) return null;
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days[timeRange]);
  return cutoff;
}

export function rowInRange(dateStr: string, cutoff: Date | null): boolean {
  if (!cutoff) return true;
  return new Date(dateStr) >= cutoff;
}

export function getSevenTicks(labels: string[]): string[] {
  const len = labels.length;
  if (len === 0) return [];
  if (len <= 7) return [...labels];
  const count = 7;
  const selected = new Set<number>([0, len - 1]);
  for (let i = 1; i < count - 1; i++) {
    selected.add(Math.round((i / (count - 1)) * (len - 1)));
  }
  return [...selected].sort((a, b) => a - b).map((i) => labels[i]);
}

export function fillDateGaps(
  points: ChartPoint[],
  timeRange: string,
): ChartPoint[] {
  const days: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "60d": 60,
    "90d": 90,
  };

  // Build lookup of existing data
  const byDate = new Map<string, number>();
  points.forEach((p) => byDate.set(p.date, p.value));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date;

  if (days[timeRange]) {
    endDate = new Date(today);
    startDate = new Date(today);
    startDate.setDate(today.getDate() - days[timeRange] + 1);
  } else {
    // "all" — span only the actual data range (no gaps beyond data)
    if (!points.length) return [];
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    startDate = new Date(sorted[0].date);
    endDate = new Date(sorted[sorted.length - 1].date);
  }

  const result: ChartPoint[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const iso = cursor.toISOString().split("T")[0];
    result.push({ date: iso, value: byDate.get(iso) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}

export function fillSegmentedDateGaps(
  points: ChartPoint[],
  timeRange: string,
): ChartPoint[] {
  if (!points.length) return [];

  const segments = Array.from(
    new Set(points.map((p) => p.segment ?? "__none__")),
  );

  // Build nested map: segment -> date -> value
  const bySegDate = new Map<string, Map<string, number>>();
  segments.forEach((seg) => bySegDate.set(seg, new Map()));
  points.forEach((p) => {
    const seg = p.segment ?? "__none__";
    bySegDate.get(seg)!.set(p.date, p.value);
  });

  const days: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "60d": 60,
    "90d": 90,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date;

  if (days[timeRange]) {
    endDate = new Date(today);
    startDate = new Date(today);
    startDate.setDate(today.getDate() - days[timeRange] + 1);
  } else {
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
    startDate = new Date(sorted[0].date);
    endDate = new Date(sorted[sorted.length - 1].date);
  }

  const result: ChartPoint[] = [];
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const iso = cursor.toISOString().split("T")[0];
    segments.forEach((seg) => {
      result.push({
        date: iso,
        value: bySegDate.get(seg)?.get(iso) ?? 0,
        segment: seg === "__none__" ? undefined : seg,
      });
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
}