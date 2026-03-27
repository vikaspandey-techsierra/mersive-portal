"use client";

import CollaborationUsage from "@/components/CollaborationChart";
import DeviceUtilization from "@/components/DeviceUtilizationChart";
import SelectableDataTable, {
  ColumnDef,
  SelectableDataTableHandle,
  DeviceTableRow,
} from "@/components/SelectedDevices";
import UserConnections from "@/components/UserConnectionsChart";
import { useState, useCallback } from "react";
import React from "react";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import { registerMetric } from "@/lib/analytics/utils/metricsManager";
import { useUsageMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";

const USAGE_COLUMNS: ColumnDef<DeviceTableRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "meetings", label: "Meetings", sortable: true },
  { key: "totalConnections", label: "Total Connections", sortable: true },
  { key: "hoursInUse", label: "Hours in Use", sortable: true },
  { key: "contentItems", label: "Content Items", sortable: true },
  {
    key: "avgDurationMinutes",
    label: "Avg. Duration",
    sortable: true,
    render: (_v, row) => row.avgDuration ?? "-",
    csvValue: (_v, row) => row.avgDuration ?? "",
  },
];

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
  hours: "ts_meetings_duration_tot",
  connections: "ts_connections_num",
  posts: "ts_posts_num",
  avgLength: "ts_meetings_duration_avg",
};
interface UsagePageProps {
  tableRef?: React.Ref<SelectableDataTableHandle>;
}

export default function UsagePage({ tableRef }: UsagePageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(
    new Set(),
  );

  registerMetric("ts_connections_num_by_os");

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const { ready } = useUsageMetrics(timeRange, {
    deviceMetricA: METRIC_API_MAP["meetings"],
    deviceMetricB: METRIC_API_MAP["connections"],
    userConnectionsMetric: "ts_connections_num_by_os",
  });

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedDevices(new Set(ids));
  }, []);

  return (
    <>
      {/* Time range */}
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
        <DeviceUtilization
          timeRange={timeRange}
          selectedDevices={selectedDevices}
        />
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
          selectedDevices={selectedDevices}
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
        <CollaborationUsage
          timeRange={timeRange}
          selectedDevices={selectedDevices}
        />
      )}

      <hr className="pb-5" />

      <SelectableDataTable
        ref={tableRef}
        heading="Selected Devices"
        subheading="Select all or narrow the data down to a specific group of devices"
        rowKey="id"
        columns={USAGE_COLUMNS}
        defaultSortKey="name"
        defaultSortDir="asc"
        defaultAllSelected
        timeRange={timeRange}
        onSelectionChange={handleSelectionChange}
        isLoading={isLoading}
        csvFilename="usage-devices"
      />
    </>
  );
}
