/**
 * useDeviceTableRows
 *
 * Reads raw TimeseriesRow data already cached in metricsStore and aggregates
 * it into per-device summary rows ready for SelectableDataTable.
 *
 * Usage tab columns:
 * Meetings        → sum(ts_meetings_num)
 * Connections     → sum(ts_connections_num)
 * Posts           → sum(ts_posts_num)
 * Total Hours     → sum(ts_meetings_duration_tot)
 * Avg. Duration   → sum(ts_meetings_duration_tot) / sum(ts_meetings_num) [minutes]
 *
 * Monitoring tab columns:
 * Downtime        → sum(ts_downtime_duration_tot)
 * Unreachable     → sum(ts_app_alerts_unreachable_num)
 * Rebooted        → sum(ts_app_alerts_rebooted_num)
 * Total Events    → sum(ts_downtime_devices_num_tot) 
 * + sum(ts_app_alerts_unreachable_num) 
 * + sum(ts_app_alerts_rebooted_num)
 */

import { useMemo } from "react";
import { timeseriesMock } from "@/lib/analytics/mock/timeseriesMock";
import { getStartDate, getEndDate } from "@/lib/analytics/timeseries/timeseriesManager";
import { TimeseriesRow } from "@/lib/analytics/timeseries/timeseriesTypes";

/* ─────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────── */

/** Filter the mock data to the active time window */
function rowsInRange(timeRange: string): TimeseriesRow[] {
  const start = getStartDate(timeRange);
  const end = getEndDate();
  return timeseriesMock.filter((r) => r.date >= start && r.date <= end);
}

/** Sum metric_value for rows matching a device and metric name */
function sumForDevice(
  rows: TimeseriesRow[],
  deviceName: string,
  metricName: string
): number {
  return rows
    .filter((r) => r.metric_name === metricName && r.device_name === deviceName)
    .reduce((acc, r) => acc + parseFloat(r.metric_value), 0);
}

/** Collect unique device names that have at least one row for ANY of the given metrics */
function uniqueDeviceNames(
  rows: TimeseriesRow[],
  metrics: string[]
): string[] {
  const set = new Set<string>();
  rows.forEach((r) => {
    if (r.device_name && metrics.includes(r.metric_name)) {
      set.add(r.device_name);
    }
  });
  return Array.from(set);
}

/** Format decimal hours as a friendly "X hr Y min" string */
function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

/* ─────────────────────────────────────────────
   USAGE TYPES & HOOK
───────────────────────────────────────────── */

export interface UsageDeviceRow extends Record<string, unknown> {
  id: string;
  name: string;
  meetings: number | null;
  connections: number | null;
  posts: number | null;
  totalHours: number | null;
  /** Raw minutes — used for sorting; display via avgDurationLabel */
  avgDurationMinutes: number | null;
  avgDurationLabel: string | null;
}

const USAGE_DEVICE_METRICS = [
  "ts_meetings_num",
  "ts_connections_num",
  "ts_posts_num",
  "ts_meetings_duration_tot",
];

export function useUsageDeviceRows(
  timeRange: string,
  ready: boolean
): UsageDeviceRow[] {
  return useMemo(() => {
    if (!ready) return [];

    const rows = rowsInRange(timeRange);
    const devices = uniqueDeviceNames(rows, USAGE_DEVICE_METRICS);

    return devices.map((deviceName) => {
      const meetings = sumForDevice(rows, deviceName, "ts_meetings_num");
      const connections = sumForDevice(rows, deviceName, "ts_connections_num");
      const posts = sumForDevice(rows, deviceName, "ts_posts_num");
      const durationTot = sumForDevice(rows, deviceName, "ts_meetings_duration_tot");

      // Avg duration in minutes = (totalHours / meetings) * 60
      const avgDurationMinutes =
        meetings > 0 ? (durationTot / meetings) * 60 : null;

      return {
        id: deviceName,
        name: deviceName,
        meetings: meetings > 0 ? meetings : null,
        connections: connections > 0 ? connections : null,
        posts: posts > 0 ? posts : null,
        totalHours: durationTot > 0 ? durationTot : null,
        avgDurationMinutes,
        avgDurationLabel:
          avgDurationMinutes !== null ? formatHours(avgDurationMinutes / 60) : null,
      };
    });
  }, [timeRange, ready]);
}

/* ─────────────────────────────────────────────
   MONITORING TYPES & HOOK
───────────────────────────────────────────── */

export interface MonitoringDeviceRow extends Record<string, unknown> {
  id: string;
  name: string;
  /** sum(ts_downtime_duration_tot) in hours */
  downtime: number | null;
  downtimeLabel: string | null;
  unreachable: number | null;
  rebooted: number | null;
  totalEvents: number | null;
}

const MONITORING_DEVICE_METRICS = [
  "ts_downtime_duration_tot",
  "ts_app_alerts_unreachable_num",
  "ts_app_alerts_rebooted_num",
];

export function useMonitoringDeviceRows(
  timeRange: string,
  ready: boolean
): MonitoringDeviceRow[] {
  return useMemo(() => {
    if (!ready) return [];

    const rows = rowsInRange(timeRange);
    const devices = uniqueDeviceNames(rows, MONITORING_DEVICE_METRICS);

    return devices.map((deviceName) => {
      const downtime = sumForDevice(rows, deviceName, "ts_downtime_duration_tot");
      const unreachable = sumForDevice(rows, deviceName, "ts_app_alerts_unreachable_num");
      const rebooted = sumForDevice(rows, deviceName, "ts_app_alerts_rebooted_num");
      
      // We specifically look at total devices affected by downtime vs raw duration
      const downtimeEvents = sumForDevice(rows, deviceName, "ts_downtime_devices_num_tot");
      
      const totalEvents =
        downtimeEvents + unreachable + rebooted > 0
          ? downtimeEvents + unreachable + rebooted
          : null;

      return {
        id: deviceName,
        name: deviceName,
        downtime: downtime > 0 ? downtime : null,
        downtimeLabel: downtime > 0 ? formatHours(downtime) : null,
        unreachable: unreachable > 0 ? unreachable : null,
        rebooted: rebooted > 0 ? rebooted : null,
        totalEvents,
      };
    });
  }, [timeRange, ready]);
}