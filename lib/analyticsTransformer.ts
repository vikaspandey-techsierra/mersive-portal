/**
 * analyticsTransformer.ts
 *
 * Transforms the flat row array returned by Cloud Function 1 into
 * chart-ready typed structures – with NO additional API calls.
 *
 * Key design decisions (per client brief):
 *  1. ONE Cloud Function call per time range → result cached in memory.
 *  2. Switching chart dropdowns/toggles only re-reads the cache.
 *  3. Front-end derived metrics (avg, ratios) computed here, never fetched.
 *  4. All field names use canonical metric names from Metrics Methodology.
 */

import {
  CloudFunction1Row,
  DeviceUtilizationPoint,
  UserConnectionPoint,
  CollaborationPoint,
  DowntimePoint,
  AlertPoint,
  TimeSeriesData,
  TimeRange,
} from "./analytics";

// ─── Normalise segment values → camelCase keys ──────────────────────────────

const OS_KEY_MAP: Record<string, keyof UserConnectionPoint> = {
  MacOS: "macos",
  Windows: "windows",
  iOS: "ios",
  Android: "android",
  Linux: "linux",
  Other: "otherOs",
};

const PROTOCOL_KEY_MAP: Record<string, keyof UserConnectionPoint> = {
  Web: "web",
  AirPlay: "airplay",
  Miracast: "miracast",
  "Google Cast": "googleCast",
  "HDMI in": "hdmiIn",
};

const MODE_KEY_MAP: Record<string, keyof UserConnectionPoint> = {
  Wireless: "wireless",
  Wired: "wired",
};

const CONFERENCE_KEY_MAP: Record<string, keyof UserConnectionPoint> = {
  Teams: "teams",
  Zoom: "zoom",
  "Presentation only": "presentationOnly",
};

// ─── Main transformer ────────────────────────────────────────────────────────

/**
 * Parse the raw flat array from Cloud Function 1 into chart-ready buckets.
 *
 * @param rows   Raw Cloud Function 1 response
 * @param range  The time range key associated with this fetch
 */
export function transformCloudFunction1(
  rows: CloudFunction1Row[],
  range: TimeRange
): TimeSeriesData {
  // Index rows by date for O(1) look-ups
  // Maps: date → metric_name → segment_1_value? → numeric value (aggregated)
  const byDate = new Map<string, Map<string, Map<string | null, number>>>();

  for (const row of rows) {
    // Skip device-level rows (device_name !== null) for org-wide charts
    // Device-level breakdowns can be handled separately in SelectedDevices table
    if (row.device_name !== null && row.device_name !== undefined) continue;

    if (!byDate.has(row.date)) byDate.set(row.date, new Map());
    const byMetric = byDate.get(row.date)!;

    if (!byMetric.has(row.metric_name)) byMetric.set(row.metric_name, new Map());
    const bySegment = byMetric.get(row.metric_name)!;

    const key = row.segment_1_value ?? null;
    const current = bySegment.get(key) ?? 0;
    bySegment.set(key, current + parseFloat(row.metric_value));
  }

  const sortedDates = Array.from(byDate.keys()).sort();

  // Helper: get a scalar metric value for a date
  const scalar = (date: string, metric: string): number => {
    return byDate.get(date)?.get(metric)?.get(null) ?? 0;
  };

  // Helper: get a segmented metric value
  const segmented = (date: string, metric: string, segValue: string): number => {
    return byDate.get(date)?.get(metric)?.get(segValue) ?? 0;
  };

  // ── Device Utilization ───────────────────────────────────────────────────
  const deviceUtilization: DeviceUtilizationPoint[] = sortedDates.map((date) => {
    const meetings = scalar(date, "ts_meetings_num");
    const durationTot = scalar(date, "ts_meetings_duration_tot");
    return {
      date,
      ts_meetings_num: meetings,
      ts_connections_num: scalar(date, "ts_connections_num"),
      ts_users_num: scalar(date, "ts_users_num") || undefined,
      ts_posts_num: scalar(date, "ts_posts_num") || undefined,
      ts_meetings_duration_tot: durationTot || undefined,
      // Derived – FE only, no extra call
      ts_meetings_duration_avg:
        meetings > 0 ? parseFloat((durationTot / meetings).toFixed(4)) : undefined,
    };
  });

  // ── User Connections ─────────────────────────────────────────────────────
  const userConnections: UserConnectionPoint[] = sortedDates.map((date) => {
    const point: UserConnectionPoint = { date };

    for (const [segVal, key] of Object.entries(OS_KEY_MAP)) {
      const v = segmented(date, "ts_connections_num_by_os", segVal);
      if (v > 0) (point as unknown as Record<string, unknown>)[key] = v;
    }
    for (const [segVal, key] of Object.entries(PROTOCOL_KEY_MAP)) {
      const v = segmented(date, "ts_conections_num_by_protocol", segVal);
      if (v > 0) (point as unknown as Record<string, unknown>)[key] = v;
    }
    for (const [segVal, key] of Object.entries(MODE_KEY_MAP)) {
      const v = segmented(date, "ts_connections_num_by_mode", segVal);
      if (v > 0) (point as unknown as Record<string, unknown>)[key] = v;
    }
    for (const [segVal, key] of Object.entries(CONFERENCE_KEY_MAP)) {
      const v = segmented(date, "ts_connections_num_by_conference", segVal);
      if (v > 0) (point as unknown as Record<string, unknown>)[key] = v;
    }

    return point;
  });

  // ── Collaboration Usage (fully derived, no extra API call) ───────────────
  const collaboration: CollaborationPoint[] = sortedDates.map((date) => {
    const meetings = scalar(date, "ts_meetings_num");
    const connections = scalar(date, "ts_connections_num");
    const posts = scalar(date, "ts_posts_num");
    return {
      date,
      // ts_meetings_connection_avg = ts_connections_num / ts_meetings_num
      ts_meetings_connection_avg:
        meetings > 0 ? parseFloat((connections / meetings).toFixed(2)) : 0,
      // ts_meetings_post_avg = ts_posts_num / ts_meetings_num
      ts_meetings_post_avg:
        meetings > 0 ? parseFloat((posts / meetings).toFixed(2)) : 0,
    };
  });

  // ── Downtime ─────────────────────────────────────────────────────────────
  // ts_downtime_devices_num_tot: count unique device-level rows per date (FE derived)
  const downtimeDevicesByDate = new Map<string, Set<string>>();
  for (const row of rows) {
    if (row.metric_name !== "ts_downtime_duration_tot") continue;
    if (row.device_name) {
      if (!downtimeDevicesByDate.has(row.date))
        downtimeDevicesByDate.set(row.date, new Set());
      downtimeDevicesByDate.get(row.date)!.add(row.device_name);
    }
  }

  const downtime: DowntimePoint[] = sortedDates.map((date) => ({
    date,
    ts_downtime_duration_tot: scalar(date, "ts_downtime_duration_tot"),
    // ts_downtime_devices_num_tot derived from device_name segmentation
    ts_downtime_devices_num_tot: downtimeDevicesByDate.get(date)?.size ?? 0,
  }));

  // ── Alerts ────────────────────────────────────────────────────────────────
  const alerts: AlertPoint[] = sortedDates.map((date) => ({
    date,
    ts_app_alerts_unreachable_num: scalar(date, "ts_app_alerts_unreachable_num"),
    ts_app_alerts_rebooted_num: scalar(date, "ts_app_alerts_rebooted_num"),
    ts_app_alerts_template_unassigned_num: scalar(date, "ts_app_alerts_template_unassigned_num"),
    ts_app_alerts_usb_in_num: scalar(date, "ts_app_alerts_usb_in_num"),
    ts_app_alerts_usb_out_num: scalar(date, "ts_app_alerts_usb_out_num"),
    ts_app_alerts_onboarded_num: scalar(date, "ts_app_alerts_onboarded_num"),
    ts_app_alerts_plan_assigned_num: scalar(date, "ts_app_alerts_plan_assigned_num"),
  }));

  return { range, deviceUtilization, userConnections, collaboration, downtime, alerts };
}

// ─── Filter helper (slice by time range without re-fetching) ─────────────────

/**
 * Slice a full TimeSeriesData payload to a shorter date window.
 * Called every time the user switches the time range toggle –
 * NO new API call is made.
 *
 * @param full    The full cached TimeSeriesData (e.g. "all time")
 * @param range   Desired window
 */
export function filterByRange(
  full: TimeSeriesData,
  range: TimeRange
): TimeSeriesData {
  if (range === "all") return { ...full, range };

  const days = { "7d": 7, "30d": 30, "60d": 60, "90d": 90 }[range];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const keep = (pts: { date: string }[]) =>
    pts.filter((p) => p.date >= cutoffStr);

  return {
    range,
    deviceUtilization: keep(full.deviceUtilization) as DeviceUtilizationPoint[],
    userConnections: keep(full.userConnections) as UserConnectionPoint[],
    collaboration: keep(full.collaboration) as CollaborationPoint[],
    downtime: keep(full.downtime) as DowntimePoint[],
    alerts: keep(full.alerts) as AlertPoint[],
  };
}