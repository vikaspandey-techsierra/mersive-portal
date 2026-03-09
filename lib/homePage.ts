/**
 * lib/homePage.ts
 *
 * Central data layer for the Analytics section.
 *
 * Architecture (per client requirements):
 * ─────────────────────────────────────────────────────────────────────────────
 *  1. ONE Cloud Function 1 call fetches ALL time-series metrics for ALL time.
 *  2. The full result is cached in module-level memory (analyticsCache).
 *  3. Switching time ranges or chart toggles calls filterByRange() on the
 *     cache – NO additional API calls are made.
 *  4. All canonical metric names from the Metrics Methodology sheet are used
 *     verbatim.  Front-end derived metrics (avg, ratios) are computed in
 *     analyticsTransformer.ts, never fetched.
 *
 * Cloud Function 1 request shape:
 *   {
 *     org_id: string,
 *     aggregation: "day",
 *     metrics: "ts_meetings_num,ts_connections_num,...",  // all metric names
 *     start_date: "YYYY-MM-DD",  // 90-day window (adjust as needed)
 *     end_date:   "YYYY-MM-DD"
 *   }
 * ─────────────────────────────────────────────────────────────────────────────
 */

// export interface AnalyticsApiResponse {
//   range: "7d" | "30d" | "60d" | "90d" | "all";
//   deviceUtilization: DeviceUtilizationPoint[];
//   userConnections: UserConnectionPoint[];
// }

import {
  transformCloudFunction1,
  filterByRange,
} from "@/lib/analyticsTransformer";
import { CloudFunction1Row, TIME_RANGE_DAYS, TimeRange, TimeSeriesData } from "./analytics";
// import { DeviceUtilizationPoint, UserConnectionPoint } from "./types/homepage";

// ─── All canonical time-series metrics requested in a single call ─────────────
//
// NOTE: metrics marked "Front end" in Metrics Methodology are NOT included
//       here (they are derived in the transformer). Metrics with status
//       "Not feasible" or "Missing data" are omitted.
//
export const ALL_TS_METRICS = [
  // Usage – Device Utilization
  "ts_meetings_num",
  "ts_connections_num",
  "ts_posts_num",
  "ts_meetings_duration_tot",
  // Usage – User Connections (segmented)
  "ts_connections_num_by_os",
  "ts_conections_num_by_protocol",   // note: intentional typo matches backend canonical name
  "ts_connections_num_by_mode",
  "ts_connections_num_by_conference",
  // Monitoring – Downtime
  "ts_downtime_duration_tot",
  // Monitoring – Alerts
  "ts_app_alerts_unreachable_num",
  "ts_app_alerts_rebooted_num",
  // Below are "Missing data" in the sheet — included for future-proofing
  "ts_app_alerts_template_unassigned_num",
  "ts_app_alerts_usb_in_num",
  "ts_app_alerts_usb_out_num",
  "ts_app_alerts_onboarded_num",
  "ts_app_alerts_plan_assigned_num",
].join(",");

// ─── In-memory cache ─────────────────────────────────────────────────────────
let analyticsCache: TimeSeriesData | null = null;
let cacheFetchedAt: number | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch Cloud Function 1 once (or use cache) and return filtered data.
 *
 * @param orgId    Organisation ID
 * @param range    Desired time range for display
 * @param forceRefresh  Bypass cache (e.g. on manual refresh)
 */
export async function fetchAnalyticsData(
  orgId: string,
  range: TimeRange,
  forceRefresh = false
): Promise<TimeSeriesData> {
  const now = Date.now();
  const cacheValid =
    analyticsCache &&
    cacheFetchedAt &&
    now - cacheFetchedAt < CACHE_TTL_MS &&
    !forceRefresh;

  if (!cacheValid) {
    // Build date window: request maximum window (90 days) and cache it all
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - TIME_RANGE_DAYS["90d"]);

    const requestBody = {
      org_id: orgId,
      aggregation: "day",
      metrics: ALL_TS_METRICS,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    };

    const rows = await callCloudFunction1(requestBody);
    analyticsCache = transformCloudFunction1(rows, "all");
    cacheFetchedAt = now;
  }

  // Slice to the requested window — zero additional API calls
  return filterByRange(analyticsCache!, range);
}

/**
 * Invalidate the in-memory cache (call after a user-triggered refresh).
 */
export function invalidateAnalyticsCache() {
  analyticsCache = null;
  cacheFetchedAt = null;
}

// ─── Cloud Function 1 caller ─────────────────────────────────────────────────

async function callCloudFunction1(body: Record<string, string>): Promise<CloudFunction1Row[]> {
  const CF1_URL = process.env.NEXT_PUBLIC_CF1_URL ?? "";

  if (!CF1_URL) {
    console.warn("[analytics] CF1_URL not set – falling back to mock data");
    return generateMockRows(90);
  }

  const res = await fetch(CF1_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`[analytics] Cloud Function 1 error ${res.status}`);
    throw new Error(`Cloud Function 1 request failed (${res.status})`);
  }

  return res.json();
}

// ─── Tick interval helper (for chart x-axis) ─────────────────────────────────

export function tickInterval(days: number): number {
  if (days <= 7) return 0;
  if (days <= 30) return 4;
  if (days <= 60) return 8;
  return 13;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Mock data generator (development / Storybook fallback) ──────────────────
//
// Produces rows in the EXACT same shape as Cloud Function 1 so the transformer
// is exercised with realistic data during local development.
//

export function generateMockRows(days: number): CloudFunction1Row[] {
  const rows: CloudFunction1Row[] = [];
  const ORG_ID = "mock-org-id";
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - days);

  const wave = [10, 13, 3, 11, 20, 4, 2];
  const r = (base: number) =>
    Math.max(0, Math.round(base + (Math.random() - 0.5) * base * 0.2));

  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split("T")[0];
    const p = wave[i % 7];

    const push = (
      metric_name: string,
      metric_value: number,
      segment_1_name: string | null = null,
      segment_1_value: string | null = null,
      device_name: string | null = null
    ) => {
      rows.push({
        aggregation_level: "Day",
        metric_name: metric_name as CloudFunction1Row["metric_name"],
        segment_1_name,
        segment_1_value,
        date,
        org_id: ORG_ID,
        device_name,
        metric_value: String(metric_value),
      });
    };

    // Usage metrics
    push("ts_meetings_num", r(p));
    push("ts_connections_num", r(p * 1.2));
    push("ts_posts_num", r(p * 1.5));
    push("ts_meetings_duration_tot", parseFloat((r(p) * 0.8).toFixed(4)));

    // OS segmented
    push("ts_connections_num_by_os", r(p * 0.3), "OS", "MacOS");
    push("ts_connections_num_by_os", r(p * 0.25), "OS", "Windows");
    push("ts_connections_num_by_os", r(p * 0.2), "OS", "iOS");
    push("ts_connections_num_by_os", r(p * 0.15), "OS", "Android");
    push("ts_connections_num_by_os", r(p * 0.05), "OS", "Linux");
    push("ts_connections_num_by_os", r(p * 0.05), "OS", "Other");

    // Protocol segmented
    push("ts_conections_num_by_protocol", r(p * 0.35), "Protocol", "Web");
    push("ts_conections_num_by_protocol", r(p * 0.28), "Protocol", "AirPlay");
    push("ts_conections_num_by_protocol", r(p * 0.15), "Protocol", "Miracast");
    push("ts_conections_num_by_protocol", r(p * 0.12), "Protocol", "Google Cast");
    push("ts_conections_num_by_protocol", r(p * 0.1), "Protocol", "HDMI in");

    // Mode segmented
    push("ts_connections_num_by_mode", r(p * 0.7), "Mode", "Wireless");
    push("ts_connections_num_by_mode", r(p * 0.3), "Mode", "Wired");

    // Conference segmented
    push("ts_connections_num_by_conference", r(p * 0.4), "Conference", "Teams");
    push("ts_connections_num_by_conference", r(p * 0.35), "Conference", "Zoom");
    push("ts_connections_num_by_conference", r(p * 0.25), "Conference", "Presentation only");

    // Monitoring – downtime
    push("ts_downtime_duration_tot", parseFloat((r(p) * 2).toFixed(4)));
    if (i % 3 === 0) push("ts_downtime_duration_tot", parseFloat((r(2)).toFixed(4)), null, null, "local");

    // Monitoring – alerts
    push("ts_app_alerts_unreachable_num", r(p * 0.5));
    push("ts_app_alerts_rebooted_num", r(p * 0.2));
  }

  return rows;
}

/**
 * Generate a full TimeSeriesData from mock rows (used by UsagePage / MonitoringPage
 * when no real API is available).
 */
export function generateMockAnalyticsData(range: TimeRange): TimeSeriesData {
  const days = { "7d": 7, "30d": 30, "60d": 60, "90d": 90, all: 90 }[range];
  const rows = generateMockRows(days);
  return transformCloudFunction1(rows, range);
}