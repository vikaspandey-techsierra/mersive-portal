"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllMetrics, getMetric } from "../utils/metricsStore";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import { timeseriesMock } from "../mock/timeseriesMock";
import {
  ChartPoint,
  DeviceUtilizationData,
  CollaborationUsageData,
} from "../timeseries/timeseriesTypes";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function getDateCutoff(timeRange: string): Date | null {
  const days: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "60d": 60,
    "90d": 90,
  };
  if (!days[timeRange]) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days[timeRange]);
  return cutoff;
}

function rowInRange(dateStr: string, cutoff: Date | null): boolean {
  if (!cutoff) return true;
  return new Date(dateStr) >= cutoff;
}

/**
 * Returns ALL unique device names present in timeseriesMock for a given
 * time range. Used to expand an empty selectedDevices set to "all devices"
 * so charts never go blank when everything is unchecked.
 */
export function getAllDeviceNames(timeRange: string): Set<string> {
  const cutoff = getDateCutoff(timeRange);
  const names = new Set<string>();
  timeseriesMock.forEach((row) => {
    if (!row.device_name) return;
    if (!rowInRange(row.date, cutoff)) return;
    names.add(row.device_name);
  });
  return names;
}

/**
 * Resolves the effective device set for chart filtering.
 * Rule: if selectedDevices is empty (user unchecked all), treat as all devices.
 */
function resolveDevices(
  selectedDevices: Set<string>,
  timeRange: string
): Set<string> {
  if (selectedDevices.size > 0) return selectedDevices;
  return getAllDeviceNames(timeRange);
}

/* ─────────────────────────────────────────────
   EXISTING HOOKS — unchanged
───────────────────────────────────────────── */

export function useUsageMetrics(
  timeRange: string,
  params: {
    deviceMetricA: string;
    deviceMetricB?: string | null;
    userConnectionsMetric: string;
  }
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAllMetrics() {
      setReady(false);

      const metricsSet = new Set<string>();
      if (params.deviceMetricA) metricsSet.add(params.deviceMetricA);
      if (params.deviceMetricB) metricsSet.add(params.deviceMetricB);
      if (params.userConnectionsMetric)
        metricsSet.add(params.userConnectionsMetric);
      metricsSet.add("ts_meetings_num");
      metricsSet.add("ts_connections_num");
      metricsSet.add("ts_posts_num");
      metricsSet.add("ts_meetings_duration_tot");

      await fetchTimeseriesMetrics(Array.from(metricsSet), timeRange);
      if (!cancelled) setReady(true);
    }

    loadAllMetrics();
    return () => { cancelled = true; };
  }, [
    timeRange,
    params.deviceMetricA,
    params.deviceMetricB,
    params.userConnectionsMetric,
  ]);

  return { ready };
}

function useMetricFromStore(
  metric: string,
  timeRange: string = "7d"
): ChartPoint[] {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    if (!metric) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData([]);
      return;
    }
    const stored = getMetric(`${metric}__${timeRange}`);
    setData(stored || []);
  }, [metric, timeRange]);

  return data;
}

export function useDeviceUtilizationMetrics(
  metricA: string,
  metricB: string,
  timeRange: string = "7d"
): DeviceUtilizationData {
  const dataA = useMetricFromStore(metricA, timeRange);
  const dataB = useMetricFromStore(metricB, timeRange);
  return { dataA, dataB };
}

export function useUserConnectionsMetrics(
  metric: string,
  timeRange: string = "7d"
): ChartPoint[] {
  return useMetricFromStore(metric, timeRange);
}

export function useCollaborationUsageMetrics(
  timeRange: string = "7d"
): CollaborationUsageData {
  const meetings    = useMetricFromStore("ts_meetings_num", timeRange);
  const connections = useMetricFromStore("ts_connections_num", timeRange);
  const posts       = useMetricFromStore("ts_posts_num", timeRange);

  const connectionsAvg = useMemo(() => {
    if (!meetings.length) return [];
    return meetings.map((m, i) => ({
      date: m.date,
      value: m.value ? (connections[i]?.value ?? 0) / m.value : 0,
    }));
  }, [meetings, connections]);

  const postsAvg = useMemo(() => {
    if (!meetings.length) return [];
    return meetings.map((m, i) => ({
      date: m.date,
      value: m.value ? (posts[i]?.value ?? 0) / m.value : 0,
    }));
  }, [meetings, posts]);

  return { connectionsAvg, postsAvg };
}

export function useMonitoringMetrics(timeRange: string) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMetrics() {
      setReady(false);
      const metricsToFetch = [
        "ts_downtime_devices_num_tot",
        "ts_downtime_duration_tot",
        "ts_app_alerts_*",
      ];
      await fetchTimeseriesMetrics(metricsToFetch, timeRange);
      if (!cancelled) setReady(true);
    }

    loadMetrics();
    return () => { cancelled = true; };
  }, [timeRange]);

  return { ready };
}

export function useDowntimeChart(timeRange: string, ready: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!ready) return;

    const devicesRaw = getMetric(`ts_downtime_devices_num_tot__${timeRange}`) || [];
    const hoursRaw   = getMetric(`ts_downtime_duration_tot__${timeRange}`) || [];
    if (!devicesRaw.length && !hoursRaw.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new Map<string, any>();
    devicesRaw.forEach((d: ChartPoint) => {
      if (!map.has(d.date)) map.set(d.date, { date: d.date, devices: 0, hours: 0 });
      map.get(d.date).devices = d.value;
    });
    hoursRaw.forEach((h: ChartPoint) => {
      if (!map.has(h.date)) map.set(h.date, { date: h.date, devices: 0, hours: 0 });
      map.get(h.date).hours = h.value;
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(Array.from(map.values()));
  }, [timeRange, ready]);

  return { data };
}

export function useAlertsChart(timeRange: string, ready: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!ready) return;

    const allMetrics  = getAllMetrics();
    const alertMetrics = Object.keys(allMetrics)
      .filter(
        (key) =>
          key.startsWith("ts_app_alerts_") && key.endsWith(`__${timeRange}`)
      )
      .map((key) => key.replace(`__${timeRange}`, ""));

    const metricsMap: Record<string, ChartPoint[]> = {};
    alertMetrics.forEach((metric) => {
      metricsMap[metric] = getMetric(`${metric}__${timeRange}`) || [];
    });

    const activeMetrics = Object.entries(metricsMap)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, arr]) => arr.some((p) => p.value > 0))
      .map(([key]) => key);

    if (!activeMetrics.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData([]);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateMap = new Map<string, any>();
    activeMetrics.forEach((metric) => {
      metricsMap[metric].forEach((point) => {
        if (!dateMap.has(point.date)) dateMap.set(point.date, { date: point.date });
        dateMap.get(point.date)[metric] = point.value;
      });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(Array.from(dateMap.values()));
  }, [timeRange, ready]);

  return { data };
}

/* ─────────────────────────────────────────────
   NEW: FILTERED CHART HOOKS
   All hooks below accept selectedDevices: Set<string>.
   When the set is empty, resolveDevices() expands it to all known
   device names — so charts never go blank when user unchecks all rows.
───────────────────────────────────────────── */

/**
 * Aggregated ChartPoint[] for a metric filtered to selected devices.
 * Values are summed per date across all matching devices.
 *
 * Used by: DeviceUtilization, CollaborationUsage.
 */
export function useFilteredChartPoints(
  metricName: string,
  timeRange: string,
  selectedDevices: Set<string>
): ChartPoint[] {
  return useMemo(() => {
    if (!metricName) return [];

    const cutoff   = getDateCutoff(timeRange);
    const devices  = resolveDevices(selectedDevices, timeRange);
    const byDate   = new Map<string, number>();

    timeseriesMock.forEach((row) => {
      if (row.metric_name !== metricName) return;
      if (!rowInRange(row.date, cutoff)) return;
      if (row.segment_1_name) return; // skip segmented rows
      if (row.device_name && !devices.has(row.device_name)) return;

      const val = parseFloat(row.metric_value) || 0;
      byDate.set(row.date, (byDate.get(row.date) ?? 0) + val);
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }, [metricName, timeRange, selectedDevices]);
}

/**
 * Segmented ChartPoint[] (preserves segment_1_value as `segment`).
 *
 * Used by: UserConnections.
 */
export function useFilteredSegmentedPoints(
  metricName: string,
  timeRange: string,
  selectedDevices: Set<string>
): ChartPoint[] {
  return useMemo(() => {
    if (!metricName) return [];

    const cutoff  = getDateCutoff(timeRange);
    const devices = resolveDevices(selectedDevices, timeRange);
    const byKey   = new Map<string, number>();

    timeseriesMock.forEach((row) => {
      if (row.metric_name !== metricName) return;
      if (!rowInRange(row.date, cutoff)) return;
      if (row.device_name && !devices.has(row.device_name)) return;

      const key = `${row.date}__${row.segment_1_value ?? ""}`;
      const val = parseFloat(row.metric_value) || 0;
      byKey.set(key, (byKey.get(key) ?? 0) + val);
    });

    return Array.from(byKey.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const sep     = key.indexOf("__");
        const date    = key.slice(0, sep);
        const segment = key.slice(sep + 2) || undefined;
        return { date, value, segment };
      });
  }, [metricName, timeRange, selectedDevices]);
}

/**
 * Filtered collaboration averages (connections per meeting, posts per meeting).
 *
 * Used by: CollaborationUsage.
 */
export function useFilteredCollaborationMetrics(
  timeRange: string,
  selectedDevices: Set<string>
): CollaborationUsageData {
  const meetings    = useFilteredChartPoints("ts_meetings_num",           timeRange, selectedDevices);
  const connections = useFilteredChartPoints("ts_connections_num",        timeRange, selectedDevices);
  const posts       = useFilteredChartPoints("ts_posts_num",              timeRange, selectedDevices);

  const connectionsAvg = useMemo(() => {
    if (!meetings.length) return [];
    return meetings.map((m, i) => ({
      date: m.date,
      value: m.value ? (connections[i]?.value ?? 0) / m.value : 0,
    }));
  }, [meetings, connections]);

  const postsAvg = useMemo(() => {
    if (!meetings.length) return [];
    return meetings.map((m, i) => ({
      date: m.date,
      value: m.value ? (posts[i]?.value ?? 0) / m.value : 0,
    }));
  }, [meetings, posts]);

  return { connectionsAvg, postsAvg };
}

/**
 * Filtered downtime data: devices down + total hours, per date.
 *
 * Used by: DowntimeChart (Monitoring page).
 */
export function useFilteredDowntimePoints(
  timeRange: string,
  selectedDevices: Set<string>
): { date: string; devices: number; hours: number }[] {
  return useMemo(() => {
    const cutoff  = getDateCutoff(timeRange);
    const devices = resolveDevices(selectedDevices, timeRange);

    // hours: sum ts_downtime_duration_tot per device per date
    const hoursByDateDevice = new Map<string, number>();
    // track unique devices down per date
    const devicesByDate     = new Map<string, Set<string>>();

    timeseriesMock.forEach((row) => {
      if (!rowInRange(row.date, cutoff)) return;
      if (row.device_name && !devices.has(row.device_name)) return;
      if (row.segment_1_name) return;

      if (row.metric_name === "ts_downtime_duration_tot") {
        const key = `${row.date}__${row.device_name ?? ""}`;
        const val = parseFloat(row.metric_value) || 0;
        hoursByDateDevice.set(key, (hoursByDateDevice.get(key) ?? 0) + val);

        if (row.device_name) {
          if (!devicesByDate.has(row.date)) devicesByDate.set(row.date, new Set());
          devicesByDate.get(row.date)!.add(row.device_name);
        }
      }
    });

    // Aggregate per date
    const byDate = new Map<string, { hours: number; devices: number }>();
    hoursByDateDevice.forEach((hours, key) => {
      const date = key.split("__")[0];
      if (!byDate.has(date)) byDate.set(date, { hours: 0, devices: 0 });
      byDate.get(date)!.hours += hours;
    });
    devicesByDate.forEach((devSet, date) => {
      if (!byDate.has(date)) byDate.set(date, { hours: 0, devices: 0 });
      byDate.get(date)!.devices = devSet.size;
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { devices: d, hours: h }]) => ({ date, devices: d, hours: h }));
  }, [timeRange, selectedDevices]);
}

/**
 * Filtered alerts data: each alert metric summed per date for selected devices.
 *
 * Used by: AlertsChart (Monitoring page).
 */
export function useFilteredAlertsPoints(
  timeRange: string,
  selectedDevices: Set<string>
): { date: string; [key: string]: number | string }[] {
  return useMemo(() => {
    const cutoff  = getDateCutoff(timeRange);
    const devices = resolveDevices(selectedDevices, timeRange);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byDate = new Map<string, Record<string, any>>();

    timeseriesMock.forEach((row) => {
      if (!row.metric_name.startsWith("ts_app_alerts_")) return;
      if (!rowInRange(row.date, cutoff)) return;
      if (row.device_name && !devices.has(row.device_name)) return;
      if (row.segment_1_name) return;

      if (!byDate.has(row.date)) byDate.set(row.date, { date: row.date });
      const entry = byDate.get(row.date)!;
      const val   = parseFloat(row.metric_value) || 0;
      entry[row.metric_name] = (entry[row.metric_name] ?? 0) + val;
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, entry]) => entry);
  }, [timeRange, selectedDevices]);
}