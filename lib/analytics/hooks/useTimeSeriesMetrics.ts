"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllMetrics, getMetric } from "../utils/metricsStore";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import {
  ChartPoint,
  DeviceUtilizationData,
  CollaborationUsageData,
} from "../timeseries/timeseriesTypes";
import { timeseriesMock } from "../mock/timeseriesMock";
import { getStartDate, getEndDate } from "../timeseries/timeseriesManager";

/* ─────────────────────────────────────────────
   EXISTING HOOKS (unchanged)
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
  const meetings = useMetricFromStore("ts_meetings_num", timeRange);
  const connections = useMetricFromStore("ts_connections_num", timeRange);
  const posts = useMetricFromStore("ts_posts_num", timeRange);

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
      await fetchTimeseriesMetrics(
        [
          "ts_downtime_devices_num_tot",
          "ts_downtime_duration_tot",
          "ts_app_alerts_*",
        ],
        timeRange
      );
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
    const hoursRaw = getMetric(`ts_downtime_duration_tot__${timeRange}`) || [];

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

    const allMetrics = getAllMetrics();
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
        if (!dateMap.has(point.date))
          dateMap.set(point.date, { date: point.date });
        dateMap.get(point.date)[metric] = point.value;
      });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(Array.from(dateMap.values()));
  }, [timeRange, ready]);

  return { data };
}

/* ─────────────────────────────────────────────
   NEW: DEVICE-FILTERED HOOKS
   These wrap the existing store-based hooks and
   re-aggregate from raw mock data when a device
   filter is active. When selectedDeviceNames is
   empty they fall back to the store values so
   there is zero performance cost in the default
   (all-selected) state.
───────────────────────────────────────────── */

/**
 * Internal helper — sums metric_value per date from raw mock rows,
 * filtered by metricName + time window + selectedDeviceNames.
 * Returns a Map<date, summedValue>.
 */
function sumRawByDate(
  metricName: string,
  start: string,
  end: string,
  selectedDeviceNames: string[],
): Map<string, number> {
  const map = new Map<string, number>();
  timeseriesMock
    .filter(
      (r) =>
        r.metric_name === metricName &&
        r.date >= start &&
        r.date <= end &&
        (selectedDeviceNames.length === 0 ||
          (r.device_name != null &&
            selectedDeviceNames.includes(r.device_name))),
    )
    .forEach((r) => {
      map.set(r.date, (map.get(r.date) ?? 0) + parseFloat(r.metric_value));
    });
  return map;
}

/** Converts a date→value Map into a sorted ChartPoint array */
function mapToChartPoints(map: Map<string, number>): ChartPoint[] {
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }));
}

/**
 * Like useDeviceUtilizationMetrics but re-aggregates from raw rows
 * when selectedDeviceNames is populated, so the chart instantly
 * reflects checkbox changes without a new API call.
 *
 * When selectedDeviceNames is empty it falls back to the store
 * (same behaviour as before).
 */
export function useFilteredDeviceUtilizationMetrics(
  metricAName: string,
  metricBName: string,
  timeRange: string,
  selectedDeviceNames: string[],
): DeviceUtilizationData {
  // Store-based fallback (used when no filter is active)
  const storeA = useMetricFromStore(metricAName, timeRange);
  const storeB = useMetricFromStore(metricBName, timeRange);

  const start = getStartDate(timeRange);
  const end = getEndDate();

  return useMemo(() => {
    if (selectedDeviceNames.length === 0) {
      return { dataA: storeA, dataB: storeB };
    }
    const dataA = metricAName
      ? mapToChartPoints(sumRawByDate(metricAName, start, end, selectedDeviceNames))
      : [];
    const dataB = metricBName
      ? mapToChartPoints(sumRawByDate(metricBName, start, end, selectedDeviceNames))
      : [];
    return { dataA, dataB };
  }, [metricAName, metricBName, start, end, selectedDeviceNames, storeA, storeB]);
}

/**
 * Like useUserConnectionsMetrics but filters raw segment rows by
 * selectedDeviceNames. Returns { rows } — an array of raw mock rows
 * already narrowed to the active time window and devices, ready for
 * the chart to group by segment_1_value.
 */
export function useFilteredUserConnectionsMetrics(
  metricName: string,
  timeRange: string,
  selectedDeviceNames: string[],
) {
  const start = getStartDate(timeRange);
  const end = getEndDate();

  // Store-based data used for the no-filter path
  const storeData = useMetricFromStore(metricName, timeRange);

  return useMemo(() => {
    const rawRows = timeseriesMock.filter(
      (r) =>
        r.metric_name === metricName &&
        r.date >= start &&
        r.date <= end &&
        r.segment_1_value !== null &&
        (selectedDeviceNames.length === 0 ||
          (r.device_name != null &&
            selectedDeviceNames.includes(r.device_name))),
    );

    // All unique segment values present in filtered rows
    const segments = Array.from(
      new Set(rawRows.map((r) => r.segment_1_value).filter(Boolean) as string[]),
    );

    // Build chart-ready rows: { date, [segment]: summedValue, ... }[]
    const byDate = new Map<string, Record<string, number>>();
    rawRows.forEach((r) => {
      const seg = r.segment_1_value!;
      if (!byDate.has(r.date)) byDate.set(r.date, {});
      const entry = byDate.get(r.date)!;
      entry[seg] = (entry[seg] ?? 0) + parseFloat(r.metric_value);
    });

    const chartRows = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({ date, ...vals }));

    return { segments, chartRows, storeData };
  }, [metricName, start, end, selectedDeviceNames, storeData]);
}

/**
 * Like useCollaborationUsageMetrics but re-aggregates per device filter.
 */
export function useFilteredCollaborationMetrics(
  timeRange: string,
  selectedDeviceNames: string[],
): CollaborationUsageData {
  const storeFallback = useCollaborationUsageMetrics(timeRange);

  const start = getStartDate(timeRange);
  const end = getEndDate();

  return useMemo(() => {
    if (selectedDeviceNames.length === 0) return storeFallback;

    const meetingsMap = sumRawByDate("ts_meetings_num", start, end, selectedDeviceNames);
    const connectionsMap = sumRawByDate("ts_connections_num", start, end, selectedDeviceNames);
    const postsMap = sumRawByDate("ts_posts_num", start, end, selectedDeviceNames);

    const dates = Array.from(
      new Set([...meetingsMap.keys(), ...connectionsMap.keys(), ...postsMap.keys()]),
    ).sort();

    const connectionsAvg: ChartPoint[] = dates.map((date) => {
      const m = meetingsMap.get(date) ?? 0;
      const c = connectionsMap.get(date) ?? 0;
      return { date, value: m > 0 ? c / m : 0 };
    });

    const postsAvg: ChartPoint[] = dates.map((date) => {
      const m = meetingsMap.get(date) ?? 0;
      const p = postsMap.get(date) ?? 0;
      return { date, value: m > 0 ? p / m : 0 };
    });

    return { connectionsAvg, postsAvg };
  }, [start, end, selectedDeviceNames, storeFallback]);
}

/**
 * Like useDowntimeChart but re-aggregates from raw rows per device filter.
 */
export function useFilteredDowntimeChart(
  timeRange: string,
  ready: boolean,
  selectedDeviceNames: string[],
) {
  // Base data from the existing hook (full-fleet aggregation)
  const { data: baseData } = useDowntimeChart(timeRange, ready);

  const start = getStartDate(timeRange);
  const end = getEndDate();

  return useMemo(() => {
    if (!ready) return { data: [] };
    if (selectedDeviceNames.length === 0) return { data: baseData };

    const devicesMap = sumRawByDate(
      "ts_downtime_devices_num_tot",
      start,
      end,
      selectedDeviceNames,
    );
    const hoursMap = sumRawByDate(
      "ts_downtime_duration_tot",
      start,
      end,
      selectedDeviceNames,
    );

    const dates = Array.from(
      new Set([...devicesMap.keys(), ...hoursMap.keys()]),
    ).sort();

    const data = dates.map((date) => ({
      date,
      devices: devicesMap.get(date) ?? 0,
      hours: hoursMap.get(date) ?? 0,
    }));

    return { data };
  }, [ready, selectedDeviceNames, baseData, start, end]);
}

/**
 * Like useAlertsChart but re-aggregates from raw rows per device filter.
 */
export function useFilteredAlertsChart(
  timeRange: string,
  ready: boolean,
  selectedDeviceNames: string[],
) {
  const { data: baseData } = useAlertsChart(timeRange, ready);

  const start = getStartDate(timeRange);
  const end = getEndDate();

  return useMemo(() => {
    if (!ready) return { data: [] };
    if (selectedDeviceNames.length === 0) return { data: baseData };

    const alertRows = timeseriesMock.filter(
      (r) =>
        r.metric_name.startsWith("ts_app_alerts_") &&
        r.date >= start &&
        r.date <= end &&
        r.device_name != null &&
        selectedDeviceNames.includes(r.device_name),
    );

    if (!alertRows.length) return { data: [] };

    const byDate = new Map<string, Record<string, number>>();
    alertRows.forEach((r) => {
      if (!byDate.has(r.date)) byDate.set(r.date, { date: r.date as never });
      const entry = byDate.get(r.date)!;
      entry[r.metric_name] =
        (entry[r.metric_name] ?? 0) + parseFloat(r.metric_value);
    });

    const data = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, metrics]) => ({ date, ...metrics }));

    return { data };
  }, [ready, selectedDeviceNames, baseData, start, end]);
}