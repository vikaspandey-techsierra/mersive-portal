"use client";

import CollaborationUsage from "@/components/CollaborationChart";
import DeviceUtilization from "@/components/DeviceUtilizationChart";
import SelectableDataTable, {
  ColumnDef,
  SelectableDataTableHandle,
} from "@/components/SelectedDevices";
import UserConnections from "@/components/UserConnectionsChart";
import { useState, useCallback } from "react";
import React from "react";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import { registerMetric } from "@/lib/analytics/utils/metricsManager";
import { useUsageMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import {
  useUsageDeviceRows,
  UsageDeviceRow,
} from "@/lib/analytics/hooks/useDeviceTableRows";

/* ── Column definitions ── */
const USAGE_COLUMNS: ColumnDef<UsageDeviceRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "meetings", label: "Meetings", sortable: true },
  { key: "connections", label: "Connections", sortable: true },
  { key: "posts", label: "Posts", sortable: true },
  {
    key: "totalHours",
    label: "Total Hours",
    sortable: true,
    render: (value) => (value === null ? "-" : (value as number).toFixed(2)),
    csvValue: (value) => (value === null ? "" : (value as number).toFixed(2)),
  },
  {
    key: "avgDurationMinutes",
    label: "Avg. Duration",
    sortable: true,
    render: (_value, row) => row.avgDurationLabel ?? "-",
    csvValue: (_value, row) => row.avgDurationLabel ?? "",
  },
];

/* ── Time range config ── */
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
  connections: "ts_connections_num",
};

interface UsagePageProps {
  tableRef?: React.Ref<SelectableDataTableHandle>;
}

export default function UsagePage({ tableRef }: UsagePageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = React.useState(true);

  // Device names currently checked in the table (empty = treat all as selected)
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);

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

  // Dynamic rows built from timeseries data — default sort: Meetings desc
  const deviceRows = useUsageDeviceRows(timeRange, ready);

  const handleSelectionChange = useCallback(
    (_ids: Set<string>, rows: UsageDeviceRow[]) => {
      setSelectedDeviceNames(rows.map((r) => r.name));
    },
    [],
  );

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
        <DeviceUtilization
          timeRange={timeRange}
          selectedDeviceNames={selectedDeviceNames}
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
          selectedDeviceNames={selectedDeviceNames}
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
          selectedDeviceNames={selectedDeviceNames}
        />
      )}

      <hr className="pb-5" />

      <SelectableDataTable<UsageDeviceRow>
        ref={tableRef}
        heading="Selected Devices"
        subheading="Select all or narrow the data down to a specific group of devices"
        rows={deviceRows}
        rowKey="id"
        columns={USAGE_COLUMNS}
        defaultSortKey="meetings"
        defaultSortDir="desc"
        defaultAllSelected
        isLoading={isLoading || !ready}
        csvFilename="usage-devices"
        onSelectionChange={handleSelectionChange}
      />
    </>
  );
}
