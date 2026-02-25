"use client";

import { useState } from "react";
import DowntimeChart, { type DowntimePoint } from "@/components/DowntimeChart";
import AlertsChart, { type AlertPoint } from "@/components/AlertChart";
import SelectedDevices from "@/components/SelectedDevices";


interface Device {
  id: string;
  name: string;
  meetings: number | null;
  totalUsers: number | null;
  hoursInUse: number | null;
  contentItems: number | null;
  avgDuration: string | null;
  avgDurationMinutes: number | null;
  contentTypes: number | null;
}


export interface MonitoringApiResponse {
  range: "7d" | "30d" | "60d" | "90d" | "all";
  downtime: DowntimePoint[];
  alerts: AlertPoint[];
  selectedDevices: Device[];
}


const MOCK_DEVICES: Device[] = [
  {
    id: "1",
    name: "Board Room",
    meetings: 2,
    totalUsers: 3,
    hoursInUse: 2,
    contentItems: 1,
    avgDuration: "1 hr",
    avgDurationMinutes: 60,
    contentTypes: 2,
  },
  {
    id: "2",
    name: "Corner Conference",
    meetings: 1,
    totalUsers: 2,
    hoursInUse: 0.5,
    contentItems: 2,
    avgDuration: "30 min",
    avgDurationMinutes: 30,
    contentTypes: 1,
  },
  {
    id: "3",
    name: "Hallway",
    meetings: 1,
    totalUsers: 1,
    hoursInUse: 0.75,
    contentItems: 1,
    avgDuration: "45 min",
    avgDurationMinutes: 45,
    contentTypes: 1,
  },
  {
    id: "4",
    name: "John’s Office",
    meetings: 2,
    totalUsers: 1,
    hoursInUse: 4,
    contentItems: 4,
    avgDuration: "2 hrs",
    avgDurationMinutes: 120,
    contentTypes: 3,
  },
  {
    id: "5",
    name: "Temp Office",
    meetings: null,
    totalUsers: null,
    hoursInUse: null,
    contentItems: null,
    avgDuration: null,
    avgDurationMinutes: null,
    contentTypes: null,
  },
];


function generateDowntime(days: number): DowntimePoint[] {
  const baseDate = new Date("2024-12-16");
  const wave = [9, 13, 3, 11, 19, 0, 0];

  const rand = (base: number, spread = 0.2) =>
    Math.max(0, Math.round(base + (Math.random() - 0.5) * base * spread));

  return Array.from({ length: days }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);

    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const p = wave[i % 7];

    return {
      date: `${month} ${day}`,
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
    const day = d.getDate();
    const factor = [8, 12, 4, 10, 18, 6, 3][i % 7];

    return {
      date: `${month} ${day}`,
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
    selectedDevices: MOCK_DEVICES,
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


export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const apiData = MOCK[timeRange];
  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);

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

      <DowntimeChart data={apiData.downtime} interval={interval} />
      <hr className="my-10 border-t border-gray-200" />
      <AlertsChart data={apiData.alerts} interval={interval} />
      <hr className="my-10 border-t border-gray-200" />
      <SelectedDevices />
    </div>
  );
}