"use client";

import Card from "@/components/Card";
import DeviceStatusPie from "@/components/charts/device-status/DeviceStatusPie";
import FleetHealthGauge from "@/components/charts/fleet-health/FleetHealthGauge";
import AlertBanner from "@/components/home/AlertBanner";
import StatCards from "@/components/home/StatCards";
import UpdatesSection from "@/components/home/UpdatesSection";
import PlanTypePie from "@/components/charts/plan-type/PlanTypePie";
import Replay from "@/components/icons/replay.svg";
import Image from "next/image";
import DeviceType from "@/components/icons/tv_black.svg";
import PlanType from "@/components/icons/dvr.svg";
import OverallFleetHealth from "@/components/icons/health_and_safety.svg";
import DeviceStatus from "@/components/icons/assignment.svg";
import Sidebar from "@/components/Sidebar";
import { formatDate } from "@/lib/analytics/utils/helpers";

// Skeletons
import FleetHealthSkeleton from "@/components/charts/fleet-health/FleetHealthSkeleton";

// CHART FUNCTIONS
import {
  useDeviceTypeMetric,
  useDeviceStatusMetric,
  usePlanTypeMetric,
  useFleetHealthMetric,
  useOfflineDevicesMetric,
  useExpiredDevicesMetric,
  useMeetingsUnderwayMetric,
  useActiveDevicesMetric,
  useAvgMeetingLengthMetric,
  useBusiestTimeMetric,
} from "@/lib/analytics/hooks/useSnapshotMetric";
import DeviceTypeDonut from "@/components/charts/device-type/DeviceTypeDonut";
import PlanTypeSkeleton from "@/components/charts/plan-type/PlanTypeSkeleton";
import DeviceTypeDonutSkeleton from "@/components/charts/device-type/DeviceTypeDonutSkeleton";
import DeviceTypeDonutEmptyState from "@/components/charts/device-type/DeviceTypeDonutEmptyState";
import DeviceStatusPieEmptyState from "@/components/charts/device-status/DeviceStatusPieEmptyState";
import PlanTypePieEmptyState from "@/components/charts/plan-type/PlanTypePieEmptyState";
import FleetHealthGaugeEmptyState from "@/components/charts/fleet-health/FleetHealthGaugeEmptyState";
import DeviceStatusSkeleton from "@/components/charts/device-status/DeviceStatusSkeleton";
import { useState } from "react";

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(
    new Date().toISOString(),
  );

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setLastRefreshedAt(new Date().toISOString());
  };

  // DEVICE BREAKDOWN METRICS
  const { data: deviceTypeData, loading: typeLoading } =
    useDeviceTypeMetric(refreshKey);

  const { data: deviceStatusData, loading: statusLoading } =
    useDeviceStatusMetric(refreshKey);

  const { data: planTypeData, loading: planLoading } =
    usePlanTypeMetric(refreshKey);

  const { data: fleetHealthData, loading: fleetLoading } =
    useFleetHealthMetric(refreshKey);

  // BANNER METRICS
  const offlineDevices = useOfflineDevicesMetric();
  const expiredDevices = useExpiredDevicesMetric();

  // STATS CARDS METRICS
  const meetingsUnderway = useMeetingsUnderwayMetric();
  const activeUsers = useActiveDevicesMetric();
  const avgMeetingLength = useAvgMeetingLengthMetric();
  const busiestTime = useBusiestTimeMetric();

  // RELEASE + FAQ DATA
  const release = {
    version: "Mersive v1.0.1",
    date: "April 10, 2024",
    bullets: [
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
    ],
  };

  const faqs = [
    {
      question: "How do I activate a device?",
      answer:
        "Plug in your Mersive device and ensure it has a network connection. Then go to app.mersive.com/activate and follow the instructions shown on the display. A plan is required to configure and connect devices. You can also add devices in bulk from the Devices list.",
      link: "https://documentation.mersive.com/en/mcs/device-activation.html",
    },
    {
      question:
        "How should I configure my network to allow for Mersive device usage?",
      answer:
        "All devices require an internet connection with DNS resolution for activation, user connection, and content sharing. You may need to allow certain URLs and open specific ports.",
      link: "https://documentation.mersive.com/en/mcs/network-requirements.html",
    },
    {
      question:
        "How do WebRTC, AirPlay, Miracast, and Google Cast sharing work?",
      answer:
        "WebRTC allows connection from most networks, while casting protocols require users to be on the same network as the Mersive device.",
      link: "https://documentation.mersive.com/en/mcs/connect-and-share.html",
    },
    {
      question: "How do I set up device configuration templates?",
      answer:
        "Templates map configurations to multiple devices. Updating a template will push changes to all mapped devices.",
    },
    {
      question: "What is Mersive Hybrid Meeting?",
      answer:
        "Users can connect and use room camera, microphone, and speaker with conferencing apps like Teams, Zoom, and Google Meet. Drivers are required.",
    },
  ];

  return (
    <div className="flex min-h-screen bg-white text-[#090814]">
      <Sidebar />
      <div className="flex-1">
        <AlertBanner
          alert={{
            offlineDevices,
            expiredOrExpiringSoon: expiredDevices,
          }}
        />
        <div className="mx-auto space-y-4 max-w-350 mt-4">
          <StatCards
            stats={{
              meetingsUnderway,
              activeUsers,
              avgMeetingLengthMin: avgMeetingLength,
              busiestTimeLabel: busiestTime,
            }}
          />
          {/* RELEASE + FAQ */}
          <UpdatesSection faqs={faqs} />
          {/* DEVICE BREAKDOWN */}
          <div className="p-8 bg-white text-black">
            <div className="text-2xl font-semibold mb-6 flex gap-2 items-center">
              {" "}
              Device Breakdown
              <span className="text-[16px] font-normal text-[#93949C]">
                {lastRefreshedAt && formatDate(lastRefreshedAt)}
              </span>
              <button onClick={handleRefresh}>
                <Image src={Replay} alt="Replay icon" width={24} height={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DEVICE TYPE */}
              <Card title="Device Type" icon={DeviceType}>
                {typeLoading ? (
                  <DeviceTypeDonutSkeleton />
                ) : !deviceTypeData || deviceTypeData.length === 0 ? (
                  <DeviceTypeDonutEmptyState />
                ) : (
                  <DeviceTypeDonut data={deviceTypeData} />
                )}
              </Card>
              {/* DEVICE STATUS */}
              <Card title="Device Status" icon={DeviceStatus}>
                {statusLoading ? (
                  <DeviceStatusSkeleton />
                ) : !deviceStatusData || deviceStatusData.length === 0 ? (
                  <DeviceStatusPieEmptyState />
                ) : (
                  <DeviceStatusPie data={deviceStatusData} />
                )}
              </Card>
              {/* PLAN TYPE */}
              <Card title="Plan Type" icon={PlanType}>
                {planLoading ? (
                  <PlanTypeSkeleton />
                ) : !planTypeData || planTypeData.length === 0 ? (
                  <PlanTypePieEmptyState />
                ) : (
                  <PlanTypePie data={planTypeData} />
                )}
              </Card>
              {/* FLEET HEALTH */}
              <Card title="Overall Fleet Health" icon={OverallFleetHealth}>
                {fleetLoading ? (
                  <FleetHealthSkeleton />
                ) : !fleetHealthData || fleetHealthData.totalDevices === 0 ? (
                  <FleetHealthGaugeEmptyState />
                ) : (
                  <FleetHealthGauge
                    score={fleetHealthData.score}
                    totalDevices={fleetHealthData.totalDevices}
                    devicesWithIssues={fleetHealthData.devicesWithIssues}
                  />
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
