"use client";

import CollaborationUsage from "@/components/CollaborationChart";
import DeviceUtilization from "@/components/DeviceUtilizationChart";
import SelectableDataTable, {
  ColumnDef,
  SelectableDataTableHandle,
} from "@/components/SelectedDevices";
import UserConnections from "@/components/UserConnectionsChart";
import { useState } from "react";
import React from "react";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import { registerMetric } from "@/lib/analytics/utils/metricsManager";
import { useUsageMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import {
  AnalyticsApiResponse,
  DAY_COUNTS,
  generateMockData,
  tickInterval,
} from "@/lib/homePage";

/* ── Row shape ── */
interface UsageDevice extends Record<string, unknown> {
  id: string;
  name: string;
  meetings: number | null;
  totalConnections: number | null;
  hoursInUse: number | null;
  contentItems: number | null;
  avgDuration: string | null;
  avgDurationMinutes: number | null;
}

/* ── Mock data ── */
const USAGE_DEVICES: UsageDevice[] = [
  {
    id: "1",
    name: "Board Room",
    meetings: 2,
    totalConnections: 3,
    hoursInUse: 2,
    contentItems: 1,
    avgDuration: "1 hr",
    avgDurationMinutes: 60,
  },
  {
    id: "2",
    name: "Corner Conference",
    meetings: 1,
    totalConnections: 2,
    hoursInUse: 0.5,
    contentItems: 2,
    avgDuration: "30 min",
    avgDurationMinutes: 30,
  },
  {
    id: "3",
    name: "Hallway",
    meetings: 1,
    totalConnections: 1,
    hoursInUse: 0.75,
    contentItems: 1,
    avgDuration: "45 min",
    avgDurationMinutes: 45,
  },
  {
    id: "4",
    name: "John's Office",
    meetings: 2,
    totalConnections: 1,
    hoursInUse: 4,
    contentItems: 4,
    avgDuration: "2 hrs",
    avgDurationMinutes: 120,
  },
  {
    id: "5",
    name: "Temp Office",
    meetings: null,
    totalConnections: null,
    hoursInUse: null,
    contentItems: null,
    avgDuration: null,
    avgDurationMinutes: null,
  },
];

/* ── Column definitions ── */
const USAGE_COLUMNS: ColumnDef<UsageDevice>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "meetings", label: "Meetings", sortable: true },
  { key: "totalConnections", label: "Total Connections", sortable: true },
  { key: "hoursInUse", label: "Hours in Use", sortable: true },
  { key: "contentItems", label: "Content Items", sortable: true },
  {
    key: "avgDurationMinutes",
    label: "Avg. Duration",
    sortable: true,
    // Sort by raw minutes, display the friendly string in the UI
    render: (_value, row) => row.avgDuration ?? "-",
    // Export the friendly string instead of the raw minutes number
    csvValue: (_value, row) => row.avgDuration ?? "",
  },
];

/* ── Time range config ── */
const MOCK: Record<string, AnalyticsApiResponse> = {
  "7d": generateMockData(7),
  "30d": generateMockData(30),
  "60d": generateMockData(60),
  "90d": generateMockData(90),
  all: generateMockData(120),
};

type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "60d", label: "Last 60 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

interface UsagePageProps {
  /** Ref forwarded from AnalyticsLayout so the Export CSV button can call exportCSV() */
  tableRef?: React.Ref<SelectableDataTableHandle>;
}

const METRIC_API_MAP: Record<string, string> = {
  meetings: "ts_meetings_num",
  users: "ts_users_num",
  hours: "ts_meetings_duration_tot",
  connections: "ts_connections_num",
  posts: "ts_posts_num",
  avgLength: "ts_meetings_duration_avg",
};

export default function UsagePage({ tableRef }: UsagePageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = React.useState(true);

  const apiData = MOCK[timeRange];
  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);
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

      <SelectableDataTable
        ref={tableRef}
        heading="Selected Devices"
        subheading="Select all or narrow the data down to a specific group of devices"
        rows={USAGE_DEVICES}
        rowKey="id"
        columns={USAGE_COLUMNS}
        defaultSortKey="name"
        defaultSortDir="asc"
        defaultAllSelected
        isLoading={isLoading}
        csvFilename="usage-devices"
      />
    </>
  );
}
