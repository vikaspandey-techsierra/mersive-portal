"use client";

import CollaborationUsage from "@/components/CollaborationChart";
import DeviceUtilization from "@/components/DeviceUtilizationChart";
import SelectedDevices from "@/components/SelectedDevices";
import UserConnections from "@/components/UserConnectionsChart";
import { useState } from "react";
import {
  AnalyticsApiResponse,
  DAY_COUNTS,
  generateMockData,
  tickInterval,
} from "@/lib/homePage";
import React from "react";
import LineChartSkeleton from "@/components/skeleton/LineChartSkeleton";
import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";

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

// PAGE
export default function UsagePage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const apiData = MOCK[timeRange];
  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

      {isLoading ? (
        <LineChartSkeleton
          title={"Device Utilization"}
          description={
            "Compare up to two types of usage data for devices in your organization"
          }
        />
      ) : (
        <DeviceUtilization
          data={apiData.deviceUtilization}
          interval={interval}
        />
      )}
      <hr className="pb-5" />
      {isLoading ? (
        <AreaChartSkeleton
          title={"User Connections"}
          description={
            "Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used"
          }
        />
      ) : (
        <UserConnections
          data={apiData.userConnections}
          interval={interval}
          title="User Connections"
          subtitle=" Compare connection modes, sharing protocols, user operating systems, and
        types of conferencing solutions used"
        />
      )}
      <hr className="pb-5" />
      {isLoading ? (
        <LineChartSkeleton
          title={"Collaboration Usage"}
          description={
            "Compare how many users connect versus how often they share a post within a meeting on average"
          }
        />
      ) : (
        <CollaborationUsage
          data={apiData.deviceUtilization}
          interval={interval}
        />
      )}
      <hr className="pb-5" />
      <SelectedDevices />
    </>
  );
}
