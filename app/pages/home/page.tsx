"use client";

import Card from "@/components/Card";
import DeviceStatusPie from "@/components/DeviceStatusPie";
import DeviceTypeDonut from "@/components/DeviceTypeDonut";
import FleetHealthGauge from "@/components/FleetHealthGauge";
import AlertBanner from "@/components/home/AlertBanner";
import StatCards from "@/components/home/StatCards";
import UpdatesSection from "@/components/home/UpdatesSection";
import PlanTypePie from "@/components/PlanTypePie";
import Replay from "@/components/icons/replay.svg";
import Image from "next/image";
import DeviceType from "@/components/icons/tv_black.svg";
import PlanType from "@/components/icons/dvr.svg";
import OverallFleetHealth from "@/components/icons/health_and_safety.svg";
import DeviceStatus from "@/components/icons/assignment.svg";
import Sidebar from "@/components/Sidebar";
import { formatDate } from "@/lib/analytics/utils/formatDate";

// Skeletons
import DeviceTypeDonutSkeleton from "@/components/skeleton/DeviceTypeDonutSkeleton";
import DeviceStatusSkeleton from "@/components/skeleton/DeviceStatusSkeleton";
import FleetHealthSkeleton from "@/components/skeleton/FleetHealthSkeleton";

// CHART FUNCTIONS
import {
  useDeviceTypeMetric,
  useDeviceStatusMetric,
  usePlanTypeMetric,
  useFleetHealthMetric,
  useOfflineDevicesMetric,
  useExpiredDevicesMetric,
  useOutdatedFirmwareMetric,
  useOtherIssuesMetric,
  useMeetingsUnderwayMetric,
  useActiveDevicesMetric,
  useAvgMeetingLengthMetric,
  useBusiestTimeMetric,
} from "@/lib/analytics/hooks/useSnapshotMetric";

export default function DashboardPage() {
  // DEVICE BREAKDOWN METRICS
  const {
    data: deviceTypeData,
    createdAt,
    loading: typeLoading,
  } = useDeviceTypeMetric();
  const { data: deviceStatusData, loading: statusLoading } =
    useDeviceStatusMetric();
  const { data: planTypeData, loading: planLoading } = usePlanTypeMetric();
  const { data: fleetHealthData, loading: fleetLoading } =
    useFleetHealthMetric();

  // BANNER METRICS
  const offlineDevices = useOfflineDevicesMetric();
  const expiredDevices = useExpiredDevicesMetric();
  const outdatedFirmware = useOutdatedFirmwareMetric();
  const otherIssues = useOtherIssuesMetric();

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
    { question: "How do I activate a device?" },
    { question: "What network settings are needed for WebRTC sharing?" },
    { question: "How do I troubleshoot using analytics?" },
    { question: "What is Mersive Hybrid Meeting?" },
  ];

  return (
    <div className="flex min-h-screen bg-white text-[#090814]">
      <Sidebar />
      <div className="flex-1">
        <AlertBanner
          alert={{
            offlineDevices,
            expiredOrExpiringSoon: expiredDevices,
            outdatedFirmware,
            otherIssues,
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
          <UpdatesSection release={release} faqs={faqs} />
          {/* DEVICE BREAKDOWN */}
          <div className="p-8 bg-white text-black">
            <div className="text-2xl font-semibold mb-6 flex gap-2 items-baseline">
              Device Breakdown
              <span className="text-[16px] font-normal text-[#93949C]">
                {createdAt ? formatDate(createdAt) : ""}
              </span>
              <Image src={Replay} alt="Replay icon" width={24} height={24} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DEVICE TYPE */}
              <Card title="Device Type" icon={DeviceType}>
                {typeLoading ? (
                  <DeviceTypeDonutSkeleton />
                ) : (
                  <DeviceTypeDonut data={deviceTypeData} />
                )}
              </Card>
              {/* DEVICE STATUS */}
              <Card title="Device Status" icon={DeviceStatus}>
                {statusLoading ? (
                  <DeviceStatusSkeleton />
                ) : (
                  <DeviceStatusPie data={deviceStatusData} />
                )}
              </Card>
              {/* PLAN TYPE */}
              <Card title="Plan Type" icon={PlanType}>
                {planLoading ? (
                  <DeviceStatusSkeleton />
                ) : (
                  <PlanTypePie data={planTypeData} />
                )}
              </Card>
              {/* FLEET HEALTH */}
              <Card title="Overall Fleet Health" icon={OverallFleetHealth}>
                {fleetLoading ? (
                  <FleetHealthSkeleton />
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
