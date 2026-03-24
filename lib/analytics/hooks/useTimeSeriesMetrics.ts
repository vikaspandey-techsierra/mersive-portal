"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllMetrics, getMetric } from "../utils/metricsStore";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import {
  ChartPoint,
  DeviceUtilizationData,
  CollaborationUsageData,
} from "../timeseries/timeseriesTypes";

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

      if (params.userConnectionsMetric) {
        metricsSet.add(params.userConnectionsMetric);
      }

      metricsSet.add("ts_meetings_num");
      metricsSet.add("ts_connections_num");
      metricsSet.add("ts_posts_num");
      metricsSet.add("ts_meetings_duration_tot");

      const metricsArray = Array.from(metricsSet);

      await fetchTimeseriesMetrics(metricsArray, timeRange);

      if (!cancelled) {
        setReady(true);
      }
    }

    loadAllMetrics();

    return () => {
      cancelled = true;
    };
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

      // Request metric groups, not individual alert metrics
      const metricsToFetch = [
        "ts_downtime_devices_num_tot",
        "ts_downtime_duration_tot",
        "ts_app_alerts_*", // group metrics for alerts chart
      ];
      await fetchTimeseriesMetrics(metricsToFetch, timeRange);

      if (!cancelled) setReady(true);
    }

    loadMetrics();

    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  return { ready };
}

export function useDowntimeChart(timeRange: string, ready: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!ready) return;

    const devicesRaw =
      getMetric(`ts_downtime_devices_num_tot__${timeRange}`) || [];
    const hoursRaw = getMetric(`ts_downtime_duration_tot__${timeRange}`) || [];

    if (!devicesRaw.length && !hoursRaw.length) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new Map<string, any>();

    devicesRaw.forEach((d: ChartPoint) => {
      if (!map.has(d.date)) {
        map.set(d.date, { date: d.date, devices: 0, hours: 0 });
      }
      map.get(d.date).devices = d.value;
    });

    hoursRaw.forEach((h: ChartPoint) => {
      if (!map.has(h.date)) {
        map.set(h.date, { date: h.date, devices: 0, hours: 0 });
      }
      map.get(h.date).hours = h.value;
    });

    const merged = Array.from(map.values());

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(merged);
  }, [timeRange, ready]);

  return { data };
}

export function useAlertsChart(timeRange: string, ready: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!ready) return;

    const allMetrics = getAllMetrics();

    // Get all alert metrics dynamically
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
        if (!dateMap.has(point.date)) {
          dateMap.set(point.date, { date: point.date });
        }
        dateMap.get(point.date)[metric] = point.value;
      });
    });

    const merged = Array.from(dateMap.values());

    // console.log("Active alert metrics:", activeMetrics);
    // console.log("Alerts merged:", merged);

    setData(merged);
  }, [timeRange, ready]);

  return { data };
}
