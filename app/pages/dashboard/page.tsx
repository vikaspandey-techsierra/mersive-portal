"use client";

import Card from "@/components/Card";
import DeviceStatusPie from "@/components/DeviceStatusPie";
import DeviceTypeDonut from "@/components/DeviceTypeDonut";
import FleetHealthGauge from "@/components/FleetHealthGauge";
import PlanTypePie from "@/components/PlanTypePie";
import { MonitoringPageExample } from "@/components/stateCard";
import { ApiResponse, DashboardData } from "@/lib/types/dashboard";
import React from "react";

// Dummy data that matches the API structure
const dummyDashboardData: DashboardData = {
  lastUpdated: "2025-12-23T15:40:00Z",
  updates: {
    latest: [
      {
        version: "Mersive v1.0.1",
        releaseNotes: [
          "Fixed connectivity issues with Gen4 devices",
          "Improved battery life optimization",
          "Enhanced security protocols",
          "Bug fixes and performance improvements",
        ],
      },
    ],
    allReleaseNotesLink: "/release-notes",
  },
  deviceBreakdown: {
    deviceTypes: [
      { type: "Gen4 Pod", count: 250 },
      { type: "Gen4 Mini", count: 40 },
      { type: "Gen4 Smart", count: 100 },
      { type: "Gen3 Pod", count: 100 },
      { type: "Gen3 Element", count: 5 },
      { type: "Gen2i Pod", count: 5 },
    ],
    deviceStatus: [
      { status: "Online", count: 214, percentage: 47 },
      { status: "In use", count: 178, percentage: 31 },
      { status: "Offline", count: 50, percentage: 22 },
    ],
    planTypes: [
      { plan: "Pro – 5 year", count: 214, percentage: 47 },
      { plan: "Pro EDU", count: 178, percentage: 31 },
      { plan: "Smart – 1 year", count: 50, percentage: 11 },
      { plan: "Pro – 3 year", count: 214, percentage: 47 },
      { plan: "Essentials EDU", count: 178, percentage: 31 },
      { plan: "Smart – 3 year", count: 50, percentage: 11 },
    ],
    fleetHealth: {
      healthScore: 7.2,
      devicesWithIssues: true,
    },
  },
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] =
    React.useState<DashboardData>(dummyDashboardData);
  //   const [isLoading, setIsLoading] = React.useState(false);

  // Function to fetch real data when API is ready
  //   const fetchDashboardData = async () => {
  //     setIsLoading(true);
  //     try {
  //       // Replace with actual API endpoint
  //       const response = await fetch("/api/dashboard");
  //       const data: ApiResponse = await response.json();
  //       if (data.success) {
  //         setDashboardData(data.data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching dashboard data:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  // Format the last updated date
  const formattedDate = new Date(dashboardData.lastUpdated).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    },
  );

  return (
    <main className="p-10 bg-white text-black min-h-screen">
      <MonitoringPageExample />
      <h1 className="text-2xl font-semibold mb-6">
        Device Breakdown as of Dec 23, 2025 at 3:40 PM
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Device Type">
          <DeviceTypeDonut />
        </Card>

        <Card title="Device Status">
          <DeviceStatusPie />
        </Card>

        <Card title="Plan Type">
          <PlanTypePie />
        </Card>

        <Card title="Overall Fleet Health">
          <FleetHealthGauge />
        </Card>
      </div>
    </main>
  );
}
