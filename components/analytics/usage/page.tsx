"use client";

import CollaborationUsage from "@/components/CollaborationChart";
import DeviceUtilization from "@/components/DeviceUtilizationChart";
import SelectedDevices from "@/components/SelectedDevices";
import UserConnections from "@/components/UserConnectionsChart";
import { useState } from "react";


// BACKEND API CONTRACT
export interface DeviceUtilizationPoint {
  date: string;
  meetings: number;
  connections: number;
}

export interface UserConnectionPoint {
  date: string;
  wireless: number;
  wired: number;
  web: number;
  airplay: number;
  miracast: number;
  googleCast: number;
  hdmiIn: number;
  macos: number;
  windows: number;
  ios: number;
  android: number;
  otherOs: number;
  teams: number;
  zoom: number;
  presentationOnly: number;
}

export interface AnalyticsApiResponse {
  range: "7d" | "30d" | "60d" | "90d" | "all";
  deviceUtilization: DeviceUtilizationPoint[];
  userConnections: UserConnectionPoint[];
}

// MOCK DATA GENERATOR
function generateMockData(days: number): AnalyticsApiResponse {
  const deviceUtilization: DeviceUtilizationPoint[] = [];
  const userConnections: UserConnectionPoint[] = [];
  const baseDate = new Date("2024-12-16");
  const wave = [10, 13, 3, 11, 20, 4, 2];
  const r = (base: number, spread = 0.1) =>
    Math.max(0, Math.round(base + (Math.random() - 0.5) * base * spread));

  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split("T")[0];
    const p = wave[i % 7];

    deviceUtilization.push({
      date,
      meetings: r(p * 0.9),
      connections: r(p * 1.1),
    });

    userConnections.push({
      date,
      wireless: r(p * 0.7),
      wired: r(p * 0.3),
      web: r(p * 0.35),
      airplay: r(p * 0.28),
      miracast: r(p * 0.15),
      googleCast: r(p * 0.12),
      hdmiIn: r(p * 0.1),
      macos: r(p * 0.3),
      windows: r(p * 0.25),
      ios: r(p * 0.2),
      android: r(p * 0.15),
      otherOs: r(p * 0.1),
      teams: r(p * 0.4),
      zoom: r(p * 0.35),
      presentationOnly: r(p * 0.25),
    });
  }

  const rangeKey = { 7: "7d", 30: "30d", 60: "60d", 90: "90d" } as Record<number, string>;
  return {
    range: (rangeKey[days] ?? "all") as AnalyticsApiResponse["range"],
    deviceUtilization,
    userConnections,
  };
}

const MOCK: Record<string, AnalyticsApiResponse> = {
  "7d": generateMockData(7),
  "30d": generateMockData(30),
  "60d": generateMockData(60),
  "90d": generateMockData(90),
  all: generateMockData(120),
};

// HELPERS
function tickInterval(days: number): number {
  if (days <= 7) return 0;
  if (days <= 30) return 4;
  if (days <= 60) return 8;
  return 13;
}

const DAY_COUNTS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 120,
};

type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "60d", label: "Last 60 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

// PAGE
export default function UsagePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const apiData = MOCK[timeRange];
  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);

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

      <DeviceUtilization data={apiData.deviceUtilization} interval={interval} />
      <hr className="pb-5"/>
      <UserConnections data={apiData.userConnections} interval={interval} />
      <hr className="pb-5"/>
      <CollaborationUsage data={apiData.deviceUtilization} interval={interval} />
      <hr className="pb-5"/>
      <SelectedDevices />
    </>
  );
}