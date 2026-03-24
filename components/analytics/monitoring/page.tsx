"use client";

import { useState, useCallback } from "react";
import DowntimeChart from "@/components/DowntimeChart";
import AlertsChart from "@/components/AlertChart";
import SelectableDataTable, {
  ColumnDef,
  SelectableDataTableHandle,
} from "@/components/SelectedDevices";
import React from "react";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";
import {
  useAlertsChart,
  useDowntimeChart,
  useMonitoringMetrics,
} from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import {
  useMonitoringDeviceRows,
  MonitoringDeviceRow,
} from "@/lib/analytics/hooks/useDeviceTableRows";

/* ── Column definitions ── */
const MONITORING_COLUMNS: ColumnDef<MonitoringDeviceRow>[] = [
  { key: "name", label: "Name", sortable: true },
  {
    key: "downtime",
    label: "Downtime (hrs)",
    sortable: true,
    render: (_value, row) => row.downtimeLabel ?? "-",
    csvValue: (_value, row) => row.downtimeLabel ?? "",
  },
  { key: "unreachable", label: "Unreachable", sortable: true },
  { key: "rebooted", label: "Rebooted", sortable: true },
  { key: "totalEvents", label: "Total Events", sortable: true },
];

type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "60d", label: "Last 60 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

const DAY_COUNTS: Record<TimeRange, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 120,
};

function tickInterval(days: number): number {
  if (days <= 7) return 0;
  if (days <= 30) return 4;
  if (days <= 60) return 8;
  return 13;
}

interface MonitoringPageProps {
  tableRef?: React.Ref<SelectableDataTableHandle>;
}

export default function MonitoringPage({ tableRef }: MonitoringPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDeviceNames, setSelectedDeviceNames] = useState<string[]>([]);

  const { ready } = useMonitoringMetrics(timeRange);

  // These give us the base fleet-total data used as the fallback when no device filter
  const { data: downtimeData } = useDowntimeChart(timeRange, ready);
  const { data: alertsData } = useAlertsChart(timeRange, ready);

  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const deviceRows = useMonitoringDeviceRows(timeRange, ready);

  const handleSelectionChange = useCallback(
    (_ids: Set<string>, rows: MonitoringDeviceRow[]) => {
      setSelectedDeviceNames(rows.map((r) => r.name));
    },
    [],
  );

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
          /* timeRange + ready forwarded so the chart's filtered hook knows the date window */
          <DowntimeChart
            data={downtimeData}
            interval={interval}
            timeRange={timeRange}
            ready={ready}
            selectedDeviceNames={selectedDeviceNames}
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
            data={alertsData}
            interval={interval}
            timeRange={timeRange}
            ready={ready}
            selectedDeviceNames={selectedDeviceNames}
          />
        )}
      </div>

      <hr className="my-10 border-t border-gray-200" />

      <SelectableDataTable<MonitoringDeviceRow>
        ref={tableRef}
        heading="Selected Devices"
        subheading="Select all or narrow the data down to a specific group of devices"
        rows={deviceRows}
        rowKey="id"
        columns={MONITORING_COLUMNS}
        defaultSortKey="downtime"
        defaultSortDir="desc"
        defaultAllSelected
        isLoading={isLoading || !ready}
        csvFilename="monitoring-devices"
        onSelectionChange={handleSelectionChange}
      />
    </div>
  );
}
