"use client";

import { useEffect, useMemo, useState } from "react";
import { getMetric, hasMetric } from "../utils/metricsStore";
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

      const metrics = [
        "ts_downtime_devices_num_tot",
        "ts_downtime_duration_tot",
        "ts_app_alerts_unreachable_num",
        "ts_app_alerts_rebooted_num",
        "ts_app_alerts_template_unassigned_num",
        "ts_app_alerts_usb_out_num",
        "ts_app_alerts_usb_in_num",
        "ts_app_alerts_onboarded_num",
        "ts_app_alerts_plan_assigned_num",
      ];

      // Only fetch missing metrics
      const missing = metrics.filter((m) => !hasMetric(`${m}__${timeRange}`));
      if (missing.length) {
        await fetchTimeseriesMetrics(missing, timeRange);
      }
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

    console.log("Downtime devices raw:", devicesRaw);
    console.log("Downtime hours raw:", hoursRaw);

    if (!devicesRaw.length && !hoursRaw.length) return;

    const base = devicesRaw.length ? devicesRaw : hoursRaw;

    const merged = base.map((d: ChartPoint, i: number) => {
      const seconds = hoursRaw[i]?.value ?? 0;
      const hours = seconds / 3600;

      return {
        date: d.date,
        hours,
        devices: 0,
      };
    });

    console.log("Downtime merged:", merged);

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

    const unreachable =
      getMetric(`ts_app_alerts_unreachable_num__${timeRange}`) || [];
    const rebooted =
      getMetric(`ts_app_alerts_rebooted_num__${timeRange}`) || [];
    const unassigned =
      getMetric(`ts_app_alerts_template_unassigned_num__${timeRange}`) || [];
    const usbOut = getMetric(`ts_app_alerts_usb_out_num__${timeRange}`) || [];
    const usbIn = getMetric(`ts_app_alerts_usb_in_num__${timeRange}`) || [];
    const onboarded =
      getMetric(`ts_app_alerts_onboarded_num__${timeRange}`) || [];
    const planAssigned =
      getMetric(`ts_app_alerts_plan_assigned_num__${timeRange}`) || [];

    const base = unreachable.length
      ? unreachable
      : rebooted.length
      ? rebooted
      : [];

    const merged = base.map((d: ChartPoint, i: number) => ({
      date: d.date,
      ts_app_alerts_unreachable_num: unreachable[i]?.value ?? 0,
      ts_app_alerts_rebooted_num: rebooted[i]?.value ?? 0,
      ts_app_alerts_template_unassigned_num: unassigned[i]?.value ?? 0,
      ts_app_alerts_usb_out_num: usbOut[i]?.value ?? 0,
      ts_app_alerts_usb_in_num: usbIn[i]?.value ?? 0,
      ts_app_alerts_onboarded_num: onboarded[i]?.value ?? 0,
      ts_app_alerts_plan_assigned_num: planAssigned[i]?.value ?? 0,
    }));

    console.log("Alerts merged:", merged);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(merged);
  }, [timeRange, ready]);

  return { data };
}
