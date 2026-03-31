"use client";

import { useState, useCallback, useEffect } from "react";
import React from "react";
import DowntimeChart from "@/components/DowntimeChart";
import AlertsChart from "@/components/AlertChart";
import SelectableDataTable from "@/components/SelectedDevices";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import { useMonitoringMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import {
  AnalyticsPageProps,
  ColumnDef,
  DeviceTableRow,
  TimeRange,
} from "@/lib/types/charts";
import { clearMetricsByOrg } from "@/lib/analytics/utils/metricsStore";

const MONITORING_COLUMNS: ColumnDef<DeviceTableRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "hoursInUse", label: "Total Downtime (hrs)", sortable: true },
];

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "60d", label: "Last 60 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export default function MonitoringPage({
  tableRef,
  orgId,
}: AnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    clearMetricsByOrg(orgId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
  }, [orgId]);

  const { ready } = useMonitoringMetrics(orgId, timeRange);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [timeRange, orgId]);

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedDevices(new Set(ids));
  }, []);

  return (
    <div className="w-full flex flex-col min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <span className="text-xl font-bold text-black">Monitoring</span>
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

      <div className="w-full min-w-0">
        {isLoading || !ready ? (
          <LineChartSkeleton
            title="Downtime"
            description="Monitor how many devices are down and for long the downtime lasted"
          />
        ) : (
          <DowntimeChart
            orgId={orgId}
            timeRange={timeRange}
            selectedDevices={selectedDevices}
          />
        )}
      </div>

      <hr className="my-10 border-t border-gray-200" />

      <div className="w-full min-w-0">
        {isLoading || !ready ? (
          <AreaChartSkeleton
            title="Alerts"
            description="Monitor the quantity and which types of alerts occurred in your fleet"
          />
        ) : (
          <AlertsChart
            orgId={orgId}
            timeRange={timeRange}
            selectedDevices={selectedDevices}
          />
        )}
      </div>

      <hr className="my-10 border-t border-gray-200" />

      <SelectableDataTable
        orgId={orgId}
        ref={tableRef}
        heading="Selected Devices"
        subheading="Select all or narrow the data down to a specific group of devices"
        rowKey="id"
        columns={MONITORING_COLUMNS}
        defaultSortKey="name"
        defaultSortDir="asc"
        defaultAllSelected
        timeRange={timeRange}
        onSelectionChange={handleSelectionChange}
        isLoading={isLoading}
        csvFilename="monitoring-devices"
        emptyStateTitle="No data for this date range"
        emptyStateDescription="Device monitoring data will appear once devices have been added and are online"
      />
    </div>
  );
}
