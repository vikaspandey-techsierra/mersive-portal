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
import Sidebar from "@/components/Sidebar";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface DashboardStats {
  meetingsUnderway: number;
  uniqueUsers: number;
  avgMeetingLengthMin: number;
  busiestTimeLabel: string;
}

interface AdminAlert {
  offlineDevices: number;
  expiredOrExpiringSoon: number;
  outdatedFirmware: number;
  otherIssues: number;
}

interface ReleaseNote {
  version: string;
  date: string;
  bullets: string[];
}

interface FaqItem {
  question: string;
  answer?: string;
}

interface DeviceTypeItem {
  name: string;
  value: number;
  color: string;
}

interface DeviceStatusItem {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface PlanTypeItem {
  name: string;
  value: number;
  percent: number;
  color: string;
}

interface FleetHealth {
  score: number;
  onlineDevices: number;
  devicesWithIssues: number;
}

interface DashboardData {
  stats: DashboardStats;
  alert: AdminAlert;
  latestRelease: ReleaseNote;
  faqs: FaqItem[];
  deviceBreakdown: {
    asOf: string;
    totalDevices: number;
    byType: DeviceTypeItem[];
    byStatus: DeviceStatusItem[];
    byPlan: PlanTypeItem[];
    fleetHealth: FleetHealth;
  };
}

// ─── DUMMY DATA ─────────────────────────────────────────────────────────────
// Replace `DUMMY_DATA` with your API response — shape is identical.

export const DUMMY_DATA: DashboardData = {
  stats: {
    meetingsUnderway: 0,
    uniqueUsers: 11,
    avgMeetingLengthMin: 50,
    busiestTimeLabel: "11 am",
  },
  alert: {
    offlineDevices: 78,
    expiredOrExpiringSoon: 2,
    outdatedFirmware: 14,
    otherIssues: 120,
  },
  latestRelease: {
    version: "Mersive v1.0.1",
    date: "April 10, 2024",
    bullets: [
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
    ],
  },
  faqs: [
    { question: "How do I activate a device?" },
    {
      question:
        "What network settings are needed for WebRTC sharing and casting?",
    },
    { question: "How do I troubleshoot using analytics?" },
    { question: "What is Mersive Hybrid Meeting?" },
    { question: "Sign up for Mersive's 2026 webinar" },
  ],
  deviceBreakdown: {
    asOf: "Dec 23, 2025 at 3:40 PM",
    totalDevices: 500,
    byType: [
      { name: "Gen4 Pod", value: 250, color: "#6366f1" },
      { name: "Gen4 Mini", value: 40, color: "#f59e0b" },
      { name: "Gen4 Smart", value: 100, color: "#a855f7" },
    ],
    byStatus: [
      { name: "Online", value: 214, percent: 47, color: "#6366f1" },
      { name: "In use", value: 178, percent: 31, color: "#a855f7" },
      { name: "Offline", value: 50, percent: 23, color: "#f59e0b" },
      { name: "Unassigned plan", value: 0, percent: 0, color: "#fbbf24" },
    ],
    byPlan: [
      { name: "Pro – 5 year", value: 214, percent: 47, color: "#6366f1" },
      { name: "Pro EDU", value: 178, percent: 31, color: "#a855f7" },
      { name: "Smart – 1 year", value: 50, percent: 23, color: "#f59e0b" },
      { name: "Pro – 3 year", value: 214, percent: 47, color: "#818cf8" },
      { name: "Essentials EDU", value: 178, percent: 31, color: "#c084fc" },
      { name: "Smart – 3 year", value: 50, percent: 23, color: "#fbbf24" },
    ],
    fleetHealth: {
      score: 7.2,
      onlineDevices: 200,
      devicesWithIssues: 14,
    },
  },
};

export default function DashboardPage() {
  // ▼ Replace this with your API call when backend is ready
  const data: DashboardData = DUMMY_DATA;

return (
  <div className="flex min-h-screen bg-white text-[#090814]">
    
    {/* LEFT SIDEBAR */}
    <Sidebar />

    {/* RIGHT CONTENT */}
    <div className="flex-1">
      <div className="mx-auto space-y-4 p-6">
        <AlertBanner alert={data.alert} />
        <StatCards stats={data.stats} />
        <UpdatesSection release={data.latestRelease} faqs={data.faqs} />

        <div className="p-6 bg-white text-black">
          <div className="text-2xl font-semibold mb-6 flex gap-2 items-baseline">
            Device Breakdown
            <span className="text-[16px] font-normal text-[#93949C]">
              as of Dec 23, 2025 at 3:40 PM
            </span>
            <span>
              <Image src={Replay} alt="Replay icon" width={24} height={24} />
            </span>
          </div>

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
        </div>
      </div>
    </div>
  </div>

  );
}
