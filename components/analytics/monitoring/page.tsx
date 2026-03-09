"use client";

/**
 * analytics/monitoring/page.tsx
 *
 * Shares the Cloud Function 1 cache with UsagePage via fetchAnalyticsData().
 * Switching time ranges calls filterByRange() on the cached payload — zero
 * additional API calls.
 *
 * Chart data shapes:
 *   data.downtime → DowntimePoint[]  (ts_downtime_duration_tot, ts_downtime_devices_num_tot)
 *   data.alerts   → AlertPoint[]     (all ts_app_alerts_* canonical metrics)
 */

import { useState, useEffect, useRef } from "react";

import { TimeSeriesData, TimeRange, TIME_RANGE_LABELS } from "@/lib/analytics";
import {
  fetchAnalyticsData,
  generateMockAnalyticsData,
  tickInterval,
} from "@/lib/homePage";
import { filterByRange } from "@/lib/analyticsTransformer";

import DowntimeChart from "@/components/DowntimeChart";
import AlertsChart from "@/components/AlertChart";
import SelectedDevices from "@/components/SelectedDevices";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";

const TIME_RANGES: TimeRange[] = ["7d", "30d", "60d", "90d", "all"];
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "mock-org-id";

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [data, setData] = useState<TimeSeriesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Full 90-day cache — switching ranges slices this, no re-fetch
  const fullCacheRef = useRef<TimeSeriesData | null>(null);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const full = await fetchAnalyticsData(ORG_ID, "all");
        if (cancelled) return;
        fullCacheRef.current = full;
        setData(filterByRange(full, "7d"));
      } catch (err) {
        if (cancelled) return;
        console.warn(
          "[MonitoringPage] API unavailable, falling back to mock:",
          err,
        );
        const mock = generateMockAnalyticsData("all");
        fullCacheRef.current = mock;
        setData(filterByRange(mock, "7d"));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []); // run once on mount

  // ── Time range switch — NO extra API call ────────────────────────────────
  function handleRangeChange(range: TimeRange) {
    setTimeRange(range);
    if (fullCacheRef.current) {
      setData(filterByRange(fullCacheRef.current, range));
    }
  }

  const days = data?.downtime.length ?? 7;
  const interval = tickInterval(days);

  return (
    <div className="w-full">
      {/* Header + time range selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="text-xl font-bold text-black">Monitoring</span>

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

      {/* ── Downtime chart ──────────────────────────────────────────────────
          data.downtime → DowntimePoint[]
          ts_downtime_duration_tot     = hours of downtime (from API)
          ts_downtime_devices_num_tot  = # of affected devices (FE-derived) */}
      {isLoading || !data ? (
        <LineChartSkeleton
          title="Downtime"
          description="Monitor how many devices are down and for how long the downtime lasted"
        />
      ) : (
        <DowntimeChart data={data.downtime} interval={interval} />
      )}

      <hr className="my-10 border-t border-gray-200" />

      {/* ── Alerts chart ────────────────────────────────────────────────────
          data.alerts → AlertPoint[]
          All ts_app_alerts_* canonical metric fields */}
      {isLoading || !data ? (
        <AreaChartSkeleton
          title="Alerts"
          description="Monitor the quantity and which types of alerts occurred in your fleet"
        />
      ) : (
        <AlertsChart data={data.alerts} interval={interval} />
      )}

      <hr className="my-10 border-t border-gray-200" />

      <SelectedDevices />
    </div>
  );
}
