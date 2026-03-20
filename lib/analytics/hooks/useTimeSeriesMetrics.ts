"use client";

import { useEffect, useState } from "react";
import { getMetric, setMetric, getAllMetrics } from "../utils/metricsStore";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import { calculateMetric, METRIC_DEPENDENCIES } from "../utils/metricsResolver";
import {
  ChartPoint,
  DeviceUtilizationData,
  CollaborationUsageData,
} from "../timeseries/timeseriesTypes";

export const DEVICE_UTILIZATION_METRICS = [
  "ts_meetings_num",
  // "ts_users_num",
  "ts_meetings_duration_tot",
  "ts_connections_num",
  "ts_posts_num",
  "ts_meetings_duration_avg",
];

export const USER_CONNECTION_METRICS = [
  "ts_connections_num_by_mode",
  "ts_connections_num_by_protocol",
  "ts_connections_num_by_os",
  "ts_connections_num_by_conference",
];

export const COLLABORATION_METRICS = [
  "ts_meetings_connection_avg",
  "ts_meetings_post_avg",
];

function useMetric(metric: string, timeRange: string = "7d"): ChartPoint[] {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    if (!metric) return;

    let cancelled = false;

    async function loadMetric() {
      const cacheKey = `${metric}__${timeRange}`;

      const dependencies = METRIC_DEPENDENCIES[metric] ?? [metric];
      const missingDeps = dependencies.filter(
        (m) => !getMetric(`${m}__${timeRange}`)
      );

      if (missingDeps.length) {
        await fetchTimeseriesMetrics(missingDeps, timeRange);
      }

      if (cancelled) return;

      let stored = getMetric(cacheKey);

      // Calculate derived metric if not directly cached
      if (!stored || stored.length === 0) {
        const allMetrics = getAllMetrics();
        const scopedMetrics: Record<string, ChartPoint[]> = {};
        Object.keys(allMetrics).forEach((key) => {
          scopedMetrics[key.replace(`__${timeRange}`, "")] = allMetrics[key];
        });

        const calculated = calculateMetric(metric, scopedMetrics);
        if (calculated?.length) {
          setMetric(cacheKey, calculated);
          stored = calculated;
        }
      }

      if (!cancelled) {
        setData(stored || []);
      }
    }

    loadMetric();

    return () => {
      cancelled = true;
    };
  }, [metric, timeRange]);

  return metric ? data : [];
}

// DEVICE UTILIZATION CHART
export function useDeviceUtilizationMetrics(
  metricA: string,
  metricB: string,
  timeRange: string = "7d"
): DeviceUtilizationData {
  const dataA = useMetric(metricA, timeRange);
  const dataB = useMetric(metricB, timeRange);
  return { dataA, dataB };
}

// USER CONNECTIONS CHART
export function useUserConnectionsMetrics(
  metric: string,
  timeRange: string = "7d"
): ChartPoint[] {
  return useMetric(metric, timeRange);
}

// COLLABORATION USAGE CHART
export function useCollaborationUsageMetrics(
  timeRange: string = "7d"
): CollaborationUsageData {
  const connectionsAvg = useMetric("ts_meetings_connection_avg", timeRange);
  const postsAvg = useMetric("ts_meetings_post_avg", timeRange);
  return { connectionsAvg, postsAvg };
}