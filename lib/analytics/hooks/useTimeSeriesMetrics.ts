"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager";
import {
  ChartPoint,
  DeviceUtilizationData,
  CollaborationUsageData,
} from "../timeseries/timeseriesTypes";
import {
  fillDateGaps,
  fillSegmentedDateGaps,
  getDateCutoff,
  getTimeseriesRows,
  resolveDevices,
  timeSeriesRowInRange,
} from "../utils/helpers";
import { AlertDataPoint } from "@/lib/types/charts";

export function useMetricFromStore(
  orgId: string,
  metric: string,
  timeRange: string,
  selectedDevices: Set<string>
): ChartPoint[] {
  return useMemo(() => {
    if (!metric) return [];

    const cutoff = getDateCutoff(timeRange);
    const devices = resolveDevices(selectedDevices, timeRange, orgId);
    const byDate = new Map<string, number>();

    getTimeseriesRows().forEach((row) => {
      if (row.org_id !== orgId) return;
      if (row.metric_name !== metric) return;
      if (!timeSeriesRowInRange(row.date, cutoff)) return;
      if (row.segment_1_name) return;
      if (row.device_name && !devices.has(row.device_name)) return;

      const val = parseFloat(row.metric_value) || 0;
      byDate.set(row.date, (byDate.get(row.date) ?? 0) + val);
    });

    const sparse = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));

    return fillDateGaps(sparse, timeRange);
  }, [orgId, metric, timeRange, selectedDevices]);
}

function useSegmentedMetricFromStore(
  orgId: string,
  metric: string,
  timeRange: string,
  selectedDevices: Set<string>
): ChartPoint[] {
  return useMemo(() => {
    if (!metric) return [];

    const cutoff = getDateCutoff(timeRange);
    const devices = resolveDevices(selectedDevices, timeRange, orgId);
    const byKey = new Map<string, number>();

    getTimeseriesRows().forEach((row) => {
      if (row.org_id !== orgId) return;
      if (row.metric_name !== metric) return;
      if (!timeSeriesRowInRange(row.date, cutoff)) return;
      if (!row.segment_1_name) return;
      if (row.device_name && !devices.has(row.device_name)) return;

      const key = `${row.date}__${row.segment_1_value ?? ""}`;
      const val = parseFloat(row.metric_value) || 0;
      byKey.set(key, (byKey.get(key) ?? 0) + val);
    });

    const sparse = Array.from(byKey.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => {
        const sep = key.indexOf("__");
        const date = key.slice(0, sep);
        const segment = key.slice(sep + 2) || undefined;
        return { date, value, segment };
      });

    return fillSegmentedDateGaps(sparse, timeRange);
  }, [orgId, metric, timeRange, selectedDevices]);
}

export function useUsageMetrics(
  orgId: string,
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

      await fetchTimeseriesMetrics(orgId, Array.from(metricsSet), timeRange);
      if (!cancelled) setReady(true);
    }

    loadAllMetrics();
    return () => {
      cancelled = true;
    };
  }, [
    orgId,
    timeRange,
    params.deviceMetricA,
    params.deviceMetricB,
    params.userConnectionsMetric,
  ]);

  return { ready };
}

export function useMonitoringMetrics(orgId: string, timeRange: string) {
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
      await fetchTimeseriesMetrics(orgId, metricsToFetch, timeRange);
      if (!cancelled) setReady(true);
    }

    loadMetrics();
    return () => {
      cancelled = true;
    };
  }, [orgId, timeRange]);

  return { ready };
}

export function useDeviceUtilizationMetrics(
  orgId: string,
  metricA: string,
  metricB: string,
  timeRange: string,
  selectedDevices: Set<string>
): DeviceUtilizationData {
  const dataA = useMetricFromStore(orgId, metricA, timeRange, selectedDevices);
  const dataB = useMetricFromStore(orgId, metricB, timeRange, selectedDevices);
  return { dataA, dataB };
}

export function useUserConnectionsMetrics(
  orgId: string,
  metric: string,
  timeRange: string,
  selectedDevices: Set<string>
): ChartPoint[] {
  return useSegmentedMetricFromStore(orgId, metric, timeRange, selectedDevices);
}

export function useCollaborationUsageMetrics(
  orgId: string,
  timeRange: string,
  selectedDevices: Set<string>
): CollaborationUsageData {
  const meetings = useMetricFromStore(
    orgId,
    "ts_meetings_num",
    timeRange,
    selectedDevices
  );
  const connections = useMetricFromStore(
    orgId,
    "ts_connections_num",
    timeRange,
    selectedDevices
  );
  const posts = useMetricFromStore(
    orgId,
    "ts_posts_num",
    timeRange,
    selectedDevices
  );

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

export function useDowntimeChart(
  orgId: string,
  timeRange: string,
  selectedDevices: Set<string>
): { data: { date: string; devices: number; hours: number }[] } {
  const data = useMemo(() => {
    const cutoff = getDateCutoff(timeRange);
    const devices = resolveDevices(selectedDevices, timeRange, orgId);

    const hoursByDateDevice = new Map<string, number>();
    const devicesByDate = new Map<string, Set<string>>();

    getTimeseriesRows().forEach((row) => {
      if (row.org_id !== orgId) return; // org filter
      if (!timeSeriesRowInRange(row.date, cutoff)) return;
      if (row.device_name && !devices.has(row.device_name)) return;
      if (row.segment_1_name) return;

      if (row.metric_name === "ts_downtime_duration_tot") {
        const key = `${row.date}__${row.device_name ?? ""}`;
        const val = parseFloat(row.metric_value) || 0;
        hoursByDateDevice.set(key, (hoursByDateDevice.get(key) ?? 0) + val);

        if (row.device_name) {
          if (!devicesByDate.has(row.date))
            devicesByDate.set(row.date, new Set());
          devicesByDate.get(row.date)!.add(row.device_name);
        }
      }
    });

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

    const sparse = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { devices: d, hours: h }]) => ({
        date,
        devices: d,
        hours: h,
      }));

    const filledDates = fillDateGaps(
      sparse.map((s) => ({ date: s.date, value: s.hours })),
      timeRange
    );
    const devMap = new Map(sparse.map((s) => [s.date, s.devices]));

    return filledDates.map((p) => ({
      date: p.date,
      devices: devMap.get(p.date) ?? 0,
      hours: p.value,
    }));
  }, [orgId, timeRange, selectedDevices]);

  return { data };
}

export function useAlertsChart(
  orgId: string,
  timeRange: string,
  selectedDevices: Set<string>
): { data: AlertDataPoint[] } {
  const data = useMemo(() => {
    const cutoff = getDateCutoff(timeRange);
    const devices = resolveDevices(selectedDevices, timeRange, orgId);

    const byDate = new Map<string, AlertDataPoint>();
    const alertKeys = new Set<string>();

    getTimeseriesRows().forEach((row) => {
      if (row.org_id !== orgId) return; // org filter
      if (!row.metric_name.startsWith("ts_app_alerts_")) return;
      if (!timeSeriesRowInRange(row.date, cutoff)) return;
      if (row.device_name && !devices.has(row.device_name)) return;
      if (row.segment_1_name) return;

      alertKeys.add(row.metric_name);

      if (!byDate.has(row.date)) byDate.set(row.date, { date: row.date });
      const entry = byDate.get(row.date)!;
      const val = parseFloat(row.metric_value) || 0;
      entry[row.metric_name] = ((entry[row.metric_name] as number) ?? 0) + val;
    });

    const sparse: AlertDataPoint[] = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, entry]) => entry);

    if (!sparse.length) return [];

    const filledDates = fillDateGaps(
      sparse.map((s) => ({ date: s.date, value: 0 })),
      timeRange
    );
    const sparseMap = new Map(sparse.map((s) => [s.date, s]));

    return filledDates.map((p): AlertDataPoint => {
      const existing = sparseMap.get(p.date);
      const result: AlertDataPoint = { date: p.date };
      alertKeys.forEach((key) => {
        result[key] = existing ? (existing[key] as number) ?? 0 : 0;
      });
      return result;
    });
  }, [orgId, timeRange, selectedDevices]);

  return { data };
}
