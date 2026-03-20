"use client";

import CollaborationUsage from "@/components/CollaborationChart";
import DeviceUtilization from "@/components/DeviceUtilizationChart";
import SelectedDevices from "@/components/SelectedDevices";
import UserConnections from "@/components/UserConnectionsChart";
import { useState } from "react";
import React from "react";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import { registerMetric } from "@/lib/analytics/utils/metricsManager";
import { useUsageMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";

type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "60d", label: "Last 60 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

const METRIC_API_MAP: Record<string, string> = {
  meetings: "ts_meetings_num",
  users: "ts_users_num",
  hours: "ts_meetings_duration_tot",
  connections: "ts_connections_num",
  posts: "ts_posts_num",
  avgLength: "ts_meetings_duration_avg",
};

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = React.useState(true);

  registerMetric("ts_connections_num_by_os");

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const deviceMetricA = METRIC_API_MAP["meetings"];
  const deviceMetricB = METRIC_API_MAP["connections"];

  const { ready } = useUsageMetrics(timeRange, {
    deviceMetricA,
    deviceMetricB,
    userConnectionsMetric: "ts_connections_num_by_os",
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="text-xl font-bold text-black">Usage</span>

        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                timeRange === key
                  ? "bg-[#6860C8] text-white border-[#6860C8]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading || !ready ? (
        <LineChartSkeleton
          title="Device Utilization"
          description="Compare up to two types of usage data for devices in your organization"
        />
      ) : (
        <DeviceUtilization timeRange={timeRange} />
      )}

      <hr className="pb-5" />

      {isLoading || !ready ? (
        <AreaChartSkeleton
          title="User Connections"
          description="Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used"
        />
      ) : (
        <UserConnections
          timeRange={timeRange}
          title="User Connections"
          subtitle="Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used"
        />
      )}

      <hr className="pb-5" />

      {isLoading || !ready ? (
        <LineChartSkeleton
          title="Collaboration Usage"
          description="Compare how many users connect versus how often they share a post within a meeting on average"
        />
      ) : (
        <CollaborationUsage timeRange={timeRange} />
      )}

      <hr className="pb-5" />
      <SelectedDevices />
    </>
  );
}
