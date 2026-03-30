import { METRIC_DEPENDENCIES } from "./metricsResolver";
import { ChartPoint } from "../timeseries/timeseriesTypes";
import { timeseriesMock } from "../mock/timeseriesMock";
import { DeviceTableRow, TimeseriesRow } from "@/lib/types/charts";

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

export function rowInRange(dateStr: string, cutoff: Date | null): boolean {
  if (!cutoff) return true;
  return new Date(dateStr) >= cutoff;
}

/// Returns exactly 7 evenly-spaced labels from the provided array.
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

export function getNiceTicks(points: ChartPoint[]): { ticks: number[]; max: number } {
  if (!points.length) return { ticks: [0, 1, 2, 3, 4], max: 4 };
  const rawMax = Math.max(...points.map((p) => p.value));
  if (rawMax === 0) return { ticks: [0, 1, 2, 3, 4], max: 4 };
  const roughStep = rawMax / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const candidates = [1, 2, 2.5, 5, 10].map((c) => c * magnitude);
  const niceStep =
    candidates.find((c) => c >= roughStep) ?? candidates[candidates.length - 1];
  const niceMax = niceStep * 4;
  const ticks = [0, 1, 2, 3, 4].map(
    (i) => Math.round(niceStep * i * 1e10) / 1e10,
  );
  return { ticks, max: niceMax };
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

/**
 * Same as fillDateGaps but preserves the `segment` field.
 * Each segment gets its own gap-filled series.
 * Used by UserConnections (segmented area chart).
 */
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

export function buildAvailableDimensions(): { label: string; metric: string }[] {
  const map = new Map<string, string>();
  timeseriesMock.forEach((row) => {
    if (!row.segment_1_name) return;
    if (!map.has(row.segment_1_name))
      map.set(row.segment_1_name, row.metric_name);
  });
  return Array.from(map.entries()).map(([label, metric]) => ({
    label,
    metric,
  }));
}

export function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getDateCutoff(timeRange: string): Date | null {
  const days: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "60d": 60,
    "90d": 90,
  };
  if (!days[timeRange]) return null;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days[timeRange]);
  return cutoff;
}


export function deriveDeviceRows(timeRange: string): DeviceTableRow[] {
  const cutoff = getDateCutoff(timeRange);

  const map = new Map<
    string,
    { meetings: number; connections: number; hours: number; posts: number }
  >();

  timeseriesMock.forEach((row) => {
    if (!row.device_name) return;
    if (cutoff && parseDateLocal(row.date) < cutoff) return;
    timeseriesMock.forEach((row) => {
      if (!row.device_name) return;
      if (cutoff && parseDateLocal(row.date) < cutoff) return;

      if (!map.has(row.device_name)) {
        map.set(row.device_name, {
          meetings: 0,
          connections: 0,
          hours: 0,
          posts: 0,
        });
      }

      const acc = map.get(row.device_name)!;
      const val = parseFloat(row.metric_value) || 0;

      // Only aggregate non-segmented metrics
      if (!row.segment_1_name) {
        switch (row.metric_name) {
          case "ts_meetings_num":
            acc.meetings += val;
            break;
          case "ts_connections_num":
            acc.connections += val;
            break;
          case "ts_meetings_duration_tot":
            acc.hours += val;
            break;
          case "ts_posts_num":
            acc.posts += val;
            break;
        }
      }
    });

    if (!map.has(row.device_name)) {
      map.set(row.device_name, {
        meetings: 0,
        connections: 0,
        hours: 0,
        posts: 0,
      });
    }

    const acc = map.get(row.device_name)!;
    const val = parseFloat(row.metric_value) || 0;

    switch (row.metric_name) {
      case "ts_meetings_num":
        acc.meetings += val;
        break;
      case "ts_connections_num":
        acc.connections += val;
        break;
      case "ts_meetings_duration_tot":
        acc.hours += val;
        break;
      case "ts_posts_num":
        acc.posts += val;
        break;
    }
  });

  return Array.from(map.entries()).map(([name, acc]) => {
    const avgMins =
      acc.meetings > 0 ? Math.round((acc.hours * 60) / acc.meetings) : null;

    let avgDuration: string | null = null;
    if (avgMins !== null) {
      const hrs = Math.floor(avgMins / 60);
      const mins = avgMins % 60;
      if (hrs > 0 && mins > 0)
        avgDuration = `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min`;
      else if (hrs > 0) avgDuration = `${hrs} hr${hrs > 1 ? "s" : ""}`;
      else avgDuration = `${mins} min`;
    }

    return {
      id: name,
      name,
      meetings: acc.meetings || null,
      totalConnections: acc.connections || null,
      hoursInUse: acc.hours ? parseFloat(acc.hours.toFixed(2)) : null,
      contentItems: acc.posts || null,
      avgDuration,
      avgDurationMinutes: avgMins,
    };
  });
}

export function getTimeseriesRows(): TimeseriesRow[] {
  return timeseriesMock as TimeseriesRow[];
}

export function timeSeriesRowInRange(dateStr: string, cutoff: Date | null): boolean {
  if (!cutoff) return true;
  return parseDateLocal(dateStr) >= cutoff;
}

export function getAllDeviceNames(timeRange: string): Set<string> {
  const cutoff = getDateCutoff(timeRange);
  const names = new Set<string>();

  getTimeseriesRows().forEach((row) => {
    if (!row.device_name) return;
    if (!rowInRange(row.date, cutoff)) return;

    names.add(row.device_name);
  });

  return names;
}

export function resolveDevices(
  selectedDevices: Set<string>,
  timeRange: string,
): Set<string> {
  if (selectedDevices.size > 0) return selectedDevices;
  return getAllDeviceNames(timeRange);
}