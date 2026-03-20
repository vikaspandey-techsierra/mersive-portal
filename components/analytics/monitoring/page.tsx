"use client";

import { useState } from "react";
import DowntimeChart, { type DowntimePoint } from "@/components/DowntimeChart";
import AlertsChart, { type AlertPoint } from "@/components/AlertChart";
import SelectableDataTable, {
  ColumnDef,
  SelectableDataTableHandle,
} from "@/components/SelectedDevices";
import React from "react";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";

/* ── Row shape ── */
interface MonitoringDevice {
  id: string;
  name: string;
  numberOfDevices: number | null;
  totalDowntime: string | null;
  /** Raw minutes — used for sorting totalDowntime */
  totalDowntimeMinutes: number | null;
  [key: string]: unknown;
}

/* ── Mock data ── */
const MONITORING_DEVICES: MonitoringDevice[] = [
  {
    id: "1",
    name: "Board Room",
    numberOfDevices: 3,
    totalDowntime: "1 hr 20 min",
    totalDowntimeMinutes: 80,
  },
  {
    id: "2",
    name: "Corner Conference",
    numberOfDevices: 2,
    totalDowntime: "45 min",
    totalDowntimeMinutes: 45,
  },
  {
    id: "3",
    name: "Hallway",
    numberOfDevices: 1,
    totalDowntime: "2 hrs",
    totalDowntimeMinutes: 120,
  },
  {
    id: "4",
    name: "John's Office",
    numberOfDevices: 1,
    totalDowntime: "30 min",
    totalDowntimeMinutes: 30,
  },
  {
    id: "5",
    name: "Temp Office",
    numberOfDevices: null,
    totalDowntime: null,
    totalDowntimeMinutes: null,
  },
];

/* ── Column definitions ── */
const MONITORING_COLUMNS: ColumnDef<MonitoringDevice>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "numberOfDevices", label: "Number of Devices", sortable: true },
  {
    key: "totalDowntimeMinutes",
    label: "Total Downtime",
    sortable: true,
    // Sort by raw minutes, display the friendly string
    render: (_value, row) => row.totalDowntime ?? "-",
    // Export the friendly string
    csvValue: (_value, row) => row.totalDowntime ?? "",
  },
];

/* ── Chart data generators (unchanged from original) ── */
export interface MonitoringApiResponse {
  range: "7d" | "30d" | "60d" | "90d" | "all";
  downtime: DowntimePoint[];
  alerts: AlertPoint[];
}

function generateDowntime(days: number): DowntimePoint[] {
  const baseDate = new Date("2024-12-16");
  const wave = [9, 13, 3, 11, 19, 0, 0];
  const rand = (base: number, spread = 0.2) =>
    Math.max(0, Math.round(base + (Math.random() - 0.5) * base * spread));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const month = d.toLocaleString("en-US", { month: "short" });
    const p = wave[i % 7];
    return {
      date: `${month} ${d.getDate()}`,
      devices: rand(p),
      hours: Number((1 + p / 20).toFixed(2)),
    };
  });
}

function generateAlerts(days: number): AlertPoint[] {
  const baseDate = new Date("2024-12-16");
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const month = d.toLocaleString("en-US", { month: "short" });
    const factor = [8, 12, 4, 10, 18, 6, 3][i % 7];
    return {
      date: `${month} ${d.getDate()}`,
      unreachable: Math.round(factor * 0.5),
      rebooted: Math.round(factor * 0.4),
      unassigned: Math.round(factor * 0.6),
      usbUnplugged: Math.round(factor * 0.3),
      usbPlugged: Math.round(factor * 0.25),
      onboarded: Math.round(factor * 0.2),
      planAssigned: Math.round(factor * 0.15),
    };
  });
}

function buildMock(days: number): MonitoringApiResponse {
  const rangeKey: Record<number, string> = {
    7: "7d",
    30: "30d",
    60: "60d",
    90: "90d",
  };
  return {
    range: (rangeKey[days] ?? "all") as MonitoringApiResponse["range"],
    downtime: generateDowntime(days),
    alerts: generateAlerts(days),
  };
}

const MOCK: Record<string, MonitoringApiResponse> = {
  "7d": buildMock(7),
  "30d": buildMock(30),
  "60d": buildMock(60),
  "90d": buildMock(90),
  all: buildMock(120),
};

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
  /** Ref forwarded from AnalyticsLayout so the Export CSV button can call exportCSV() */
  tableRef?: React.Ref<SelectableDataTableHandle>;
}

export default function MonitoringPage({ tableRef }: MonitoringPageProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [isLoading, setIsLoading] = React.useState(true);

  const apiData = MOCK[timeRange];
  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full">
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

      {isLoading ? (
        <LineChartSkeleton
          title="Downtime"
          description="Monitor how many devices are down and for long the downtime lasted"
        />
      ) : (
        <DowntimeChart data={apiData.downtime} interval={interval} />
      )}

      <hr className="my-10 border-t border-gray-200" />

      {isLoading ? (
        <AreaChartSkeleton
          title="Alerts"
          description="Monitor the quantity and which types of alerts occurred in your fleet"
        />
      ) : (
        <AlertsChart data={apiData.alerts} interval={interval} />
      )}

      <hr className="my-10 border-t border-gray-200" />

      <SelectableDataTable
        ref={tableRef}
        heading="Selected Devices"
        subheading="Select all or narrow the data down to a specific group of devices"
        rows={MONITORING_DEVICES}
        rowKey="id"
        columns={MONITORING_COLUMNS}
        defaultSortKey="name"
        defaultSortDir="asc"
        defaultAllSelected
        isLoading={isLoading}
        csvFilename="monitoring-devices"
      />
    </div>
  );
}
