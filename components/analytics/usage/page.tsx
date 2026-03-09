"use client";

/**
 * analytics/usage/page.tsx
 *
 * Fetches analytics data ONCE via fetchAnalyticsData() and caches it.
 * Switching time range or chart toggles does NOT re-call the Cloud Function –
 * it calls filterByRange() on the cached payload instead.
 */

import CollaborationUsage from "@/components/CollaborationChart";
import DeviceUtilization from "@/components/DeviceUtilizationChart";
import SelectedDevices from "@/components/SelectedDevices";
import UserConnections from "@/components/UserConnectionsChart";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import { useState, useEffect, useRef } from "react";

import { TimeSeriesData, TimeRange, TIME_RANGE_LABELS } from "@/lib/analytics";
import {
  fetchAnalyticsData,
  generateMockAnalyticsData,
  tickInterval,
} from "@/lib/homePage";
import { filterByRange } from "@/lib/analyticsTransformer";

// Ordered list of time range options shown in the UI
const TIME_RANGES: TimeRange[] = ["7d", "30d", "60d", "90d", "all"];

// Replace with real org_id from auth context / env
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "mock-org-id";

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep a ref to the full "all-time" payload so switching ranges is instant
  const fullCacheRef = useRef<TimeSeriesData | null>(null);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        // fetchAnalyticsData fetches all 90 days once; subsequent calls use cache
        const full = await fetchAnalyticsData(ORG_ID, "all");
        if (cancelled) return;
        fullCacheRef.current = full;
        setData(filterByRange(full, timeRange));
      } catch (err) {
        if (cancelled) return;
        console.warn("[UsagePage] API unavailable, using mock data:", err);
        // Graceful fallback to mock data during development
        const mock = generateMockAnalyticsData("all");
        fullCacheRef.current = mock;
        setData(filterByRange(mock, timeRange));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Time range switch – NO extra API call ─────────────────────────────────
  function handleRangeChange(range: TimeRange) {
    setTimeRange(range);
    if (fullCacheRef.current) {
      setData(filterByRange(fullCacheRef.current, range));
    }
  }

  const days = data?.deviceUtilization.length ?? 7;
  const interval = tickInterval(days);

  return (
    <>
      {/* Time range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="text-xl font-bold text-black">Usage</span>
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map((key) => (
            <button
              key={key}
              onClick={() => handleRangeChange(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                timeRange === key
                  ? "bg-[#6860C8] text-white border-[#6860C8]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {TIME_RANGE_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Device Utilization */}
      {isLoading || !data ? (
        <LineChartSkeleton
          title="Device Utilization"
          description="Compare up to two types of usage data for devices in your organization"
        />
      ) : (
        <DeviceUtilization data={data.deviceUtilization} interval={interval} />
      )}
      <hr className="pb-5" />

      {/* User Connections */}
      {isLoading || !data ? (
        <AreaChartSkeleton
          title="User Connections"
          description="Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used"
        />
      ) : (
        <UserConnections
          data={data.userConnections}
          interval={interval}
          title="User Connections"
          subtitle="Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used"
        />
      )}
      <hr className="pb-5" />

      {/* Collaboration Usage
          data.collaboration[].ts_meetings_connection_avg  — FE-derived
          data.collaboration[].ts_meetings_post_avg        — FE-derived
          No extra API call – both fields computed in analyticsTransformer */}
      {isLoading || !data ? (
        <LineChartSkeleton
          title="Collaboration Usage"
          description="Compare how many users connect versus how often they share a post within a meeting on average"
        />
      ) : (
        <CollaborationUsage data={data.collaboration} interval={interval} />
      )}
      <hr className="pb-5" />

      <SelectedDevices />
    </>
  );
}
