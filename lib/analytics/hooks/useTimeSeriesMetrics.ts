"use client";

import { useEffect, useMemo, useState } from "react";
import { getMetric } from "../utils/metricsStore";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import {
  ChartPoint,
  DeviceUtilizationData,
  CollaborationUsageData,
} from "../timeseries/timeseriesTypes";

export function useDashboardMetrics(
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

// Device utilization
export function useDeviceUtilizationMetrics(
  metricA: string,
  metricB: string,
  timeRange: string = "7d"
): DeviceUtilizationData {
  const dataA = useMetricFromStore(metricA, timeRange);
  const dataB = useMetricFromStore(metricB, timeRange);

  return { dataA, dataB };
}

// User connections
export function useUserConnectionsMetrics(
  metric: string,
  timeRange: string = "7d"
): ChartPoint[] {
  return useMetricFromStore(metric, timeRange);
}

// Collaboration
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