"use client";

import { useEffect, useState } from "react";
import { registerMetric } from "../utils/metricsManager";
import {
  getMetric,
  hasMetric,
  setMetric,
  getAllMetrics,
} from "../utils/metricsStore";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import { calculateMetric } from "../utils/metricsResolver.ts";
import { METRIC_DEPENDENCIES } from "../utils/metricsResolver.ts";

// METRIC DEFINITIONS
export const DEVICE_UTILIZATION_METRICS = [
  "ts_meetings_num",
  "ts_users_num",
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

// GENERIC METRIC HOOK
function useMetric(metric: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadMetric() {
      if (!metric) {
        setData([]);
        return;
      }

      registerMetric(metric);

      // esolve metric dependencies
      const dependencies = METRIC_DEPENDENCIES[metric] ?? [metric];

      const missing = dependencies.filter((m) => !hasMetric(m));

      if (missing.length) {
        console.log(" Fetching dependency metrics:", missing);
        await fetchTimeseriesMetrics(missing);
      }

      let stored = getMetric(metric);

      // calculate derived metric if not stored
      if (!stored || stored.length === 0) {
        const calculated = calculateMetric(metric, getAllMetrics());

        if (calculated && calculated.length) {
          console.log(" Calculated metric:", metric);

          setMetric(metric, calculated);

          stored = calculated;
        }
      }

      setData(stored || []);
    }

    loadMetric();
  }, [metric]);

  return data;
}

// DEVICE UTILIZATION CHART
export function useDeviceUtilizationMetrics(metricA: string, metricB: string) {
  const dataA = useMetric(metricA);
  const dataB = useMetric(metricB);

  return {
    dataA,
    dataB,
  };
}

// USER CONNECTIONS CHART
export function useUserConnectionsMetrics(metric: string) {
  const data = useMetric(metric);

  return data;
}

// COLLABORATION USAGE CHART
export function useCollaborationUsageMetrics() {
  const connectionsAvg = useMetric("ts_meetings_connection_avg");
  const postsAvg = useMetric("ts_meetings_post_avg");

  return {
    connectionsAvg,
    postsAvg,
  };
}
