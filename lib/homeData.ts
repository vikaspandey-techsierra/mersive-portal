import { DashboardApiResponse } from "./types/api";


// ============================================================
// DUMMY DATA — Mirrors the real API shape exactly.
// To connect the real API, replace this export with a fetch:
//
//   export async function getDashboardData(): Promise<DashboardApiResponse> {
//     const res = await fetch("/api/dashboard");
//     if (!res.ok) throw new Error("Failed to fetch dashboard data");
//     return res.json();
//   }
// ============================================================


export const DUMMY_DASHBOARD_DATA: DashboardApiResponse = {
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
    date: "2024-04-10T00:00:00Z",
    bullets: [
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
    ],
  },

  faqs: [
    { question: "How do I activate a device?" },
    { question: "What network settings are needed for WebRTC sharing and casting?" },
    { question: "How do I troubleshoot using analytics?" },
    { question: "What is Mersive Hybrid Meeting?" },
    { question: "Sign up for Mersive's 2026 webinar" },
  ],

  deviceBreakdown: {
    asOf: "2025-12-23T15:40:00Z",
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