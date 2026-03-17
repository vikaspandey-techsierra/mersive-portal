"use client";

import { useEffect, useState } from "react";
import { getMetric, setMetric, getAllMetrics } from "../utils/metricsStore";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import { calculateMetric } from "../utils/metricsResolver";
import { registerMetric, getRegisteredMetrics } from "../utils/metricsManager";
import {
  ChartPoint,
  DeviceUtilizationData,
  CollaborationUsageData,
} from "../timeseries/timeseriesTypes";

function useMetric(metric: string, timeRange: string = "7d"): ChartPoint[] {
  const [data, setData] = useState<ChartPoint[]>([]);

  useEffect(() => {
    if (!metric) return;

    let cancelled = false;

    async function loadMetric() {
      const cacheKey = `${metric}__${timeRange}`;

      //register metric
      registerMetric(metric);

      let stored = getMetric(cacheKey);

      //BATCHING
      if (!stored) {
        const registered = getRegisteredMetrics();

        const metricsToFetch = Array.from(
          new Set([metric, ...registered])
        );

        await fetchTimeseriesMetrics(metricsToFetch, timeRange);
      }

      if (cancelled) return;

      stored = getMetric(cacheKey);

      //derived metrics
      if (!stored || stored.length === 0) {
        const allMetrics = getAllMetrics();
        const scopedMetrics: Record<string, ChartPoint[]> = {};

        Object.keys(allMetrics).forEach((key) => {
          if (key.endsWith(`__${timeRange}`)) {
            scopedMetrics[key.replace(`__${timeRange}`, "")] =
              allMetrics[key];
          }
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

// DEVICE UTILIZATION
export function useDeviceUtilizationMetrics(
  metricA: string,
  metricB: string,
  timeRange: string = "7d"
): DeviceUtilizationData {
  const dataA = useMetric(metricA, timeRange);
  const dataB = useMetric(metricB, timeRange);
  return { dataA, dataB };
}

// USER CONNECTIONS
export function useUserConnectionsMetrics(
  metric: string,
  timeRange: string = "7d"
): ChartPoint[] {
  return useMetric(metric, timeRange);
}

// COLLABORATION
export function useCollaborationUsageMetrics(
  timeRange: string = "7d"
): CollaborationUsageData {
  const connectionsAvg = useMetric("ts_meetings_connection_avg", timeRange);
  const postsAvg = useMetric("ts_meetings_post_avg", timeRange);
  return { connectionsAvg, postsAvg };
}