/**
 * Canonical metric names from the Metrics Methodology sheet.
 * These are the standardized names passed to and returned from Cloud Functions.
 *
 * Cloud Function 1 — Time Series (Analytics - Usage & Monitoring tabs)
 * Cloud Function 2 — Snapshot / Current State (Home page cards & device breakdown)
 */

// ─── Cloud Function 1 raw row ────────────────────────────────────────────────
export interface CloudFunction1Row {
  aggregation_level: "Day" | "Week" | "Month";
  metric_name: TimeSeriesMetricName;
  segment_1_name: string | null;
  segment_1_value: string | null;
  date: string; // "YYYY-MM-DD"
  org_id: string;
  device_name: string | null;
  metric_value: string; // always a string from the API – parse to number as needed
}

// ─── Cloud Function 2 raw row ────────────────────────────────────────────────
export interface CloudFunction2Row {
  org_id: string;
  metric_name: SnapshotMetricName;
  segment_1_name: string | null;
  segment_1_value: string | null;
  metric_value: string;
  devices_list: string | null;
  created_at: string;
}

// ─── Canonical time-series metric names (Cloud Function 1) ───────────────────
export type TimeSeriesMetricName =
  // Usage – Device Utilization chart
  | "ts_meetings_num"            // # of meetings
  | "ts_users_num"               // # of users (not feasible yet)
  | "ts_connections_num"         // # of connections
  | "ts_posts_num"               // # of posts / content items
  | "ts_meetings_duration_tot"   // hours in use (sum)
  // Usage – computed on front end (no API call needed)
  | "ts_meetings_duration_avg"   // avg meeting length = ts_meetings_duration_tot / ts_meetings_num
  | "ts_meetings_connection_avg" // avg connections per meeting = ts_connections_num / ts_meetings_num
  | "ts_meetings_post_avg"       // avg posts per meeting = ts_posts_num / ts_meetings_num
  // Usage – User Connections chart (segmented)
  | "ts_connections_num_by_mode"       // Mode: Wireless / Wired
  | "ts_conections_num_by_protocol"    // Protocol: Web / AirPlay / Miracast / Google Cast / HDMI in
  | "ts_connections_num_by_os"         // OS: MacOS / Windows / iOS / Android / Other
  | "ts_connections_num_by_conference" // Conference: Teams / Zoom / Presentation only
  // Monitoring – Downtime chart
  | "ts_downtime_duration_tot"      // downtime hours
  | "ts_downtime_devices_num_tot"   // # of devices with downtime (front-end derived)
  // Monitoring – Alerts chart
  | "ts_app_alerts_unreachable_num"
  | "ts_app_alerts_rebooted_num"
  | "ts_app_alerts_template_unassigned_num"
  | "ts_app_alerts_usb_in_num"
  | "ts_app_alerts_usb_out_num"
  | "ts_app_alerts_onboarded_num"
  | "ts_app_alerts_plan_assigned_num";

// ─── Canonical snapshot metric names (Cloud Function 2) ──────────────────────
export type SnapshotMetricName =
  // Home – stat cards
  | "cs_meetings_num"                  // meetings underway
  | "agg_users_num"                    // unique users (not feasible yet)
  | "agg_meetings_duration_avg"        // avg meeting length (last 30 days)
  | "agg_busiest_time"                 // busiest hour of day
  // Home – requires admin attention banner
  | "cs_offline_devices_num"
  | "cs_expired_and_soon_devices_num"
  | "cs_outdated_firmware_devices_num"
  // Home – device breakdown charts
  | "cs_devices_num_by_type"
  | "cs_devices_num_by_status"
  | "cs_devices_num_by_plan";

// ─── Processed / chart-ready structures ──────────────────────────────────────

/**
 * One date-point for the Device Utilization line chart.
 * Fields use canonical metric names as keys.
 */
export interface DeviceUtilizationPoint {
  date: string;
  ts_meetings_num: number;
  ts_connections_num: number;
  ts_users_num?: number;
  ts_posts_num?: number;
  ts_meetings_duration_tot?: number;
  // derived on FE – no extra API call
  ts_meetings_duration_avg?: number;
}

/**
 * One date-point for the User Connections area chart.
 * segment_1_value values are spread into their own keys.
 */
export interface UserConnectionPoint {
  date: string;
  // by_mode
  wireless?: number;
  wired?: number;
  // by_protocol
  web?: number;
  airplay?: number;
  miracast?: number;
  googleCast?: number;
  hdmiIn?: number;
  // by_os
  macos?: number;
  windows?: number;
  ios?: number;
  android?: number;
  linux?: number;
  otherOs?: number;
  // by_conference
  teams?: number;
  zoom?: number;
  presentationOnly?: number;
}

/**
 * One date-point for the Collaboration Usage line chart.
 * Derived metrics – computed from other canonical metrics, no extra API call.
 */
export interface CollaborationPoint {
  date: string;
  ts_meetings_connection_avg: number; // connections / meetings
  ts_meetings_post_avg: number;       // posts / meetings
}

/**
 * One date-point for the Monitoring – Downtime dual-axis chart.
 */
export interface DowntimePoint {
  date: string;
  ts_downtime_duration_tot: number;
  ts_downtime_devices_num_tot: number; // derived: count distinct device_name rows
}

/**
 * One date-point for the Monitoring – Alerts stacked area chart.
 */
export interface AlertPoint {
  date: string;
  ts_app_alerts_unreachable_num: number;
  ts_app_alerts_rebooted_num: number;
  ts_app_alerts_template_unassigned_num: number;
  ts_app_alerts_usb_in_num: number;
  ts_app_alerts_usb_out_num: number;
  ts_app_alerts_onboarded_num: number;
  ts_app_alerts_plan_assigned_num: number;
}

/**
 * Full parsed payload from a single Cloud Function 1 call.
 * All time ranges share ONE fetch; switching chart toggles only re-slices this cache.
 */
export interface TimeSeriesData {
  range: TimeRange;
  deviceUtilization: DeviceUtilizationPoint[];
  userConnections: UserConnectionPoint[];
  collaboration: CollaborationPoint[];
  downtime: DowntimePoint[];
  alerts: AlertPoint[];
}

// ─── Time range helpers ───────────────────────────────────────────────────────
export type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";

export const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 9999,
};

export const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "60d": "Last 60 days",
  "90d": "Last 90 days",
  all: "All time",
};