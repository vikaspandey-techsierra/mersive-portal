import { DashboardData } from "./types/dashboard";


export const dashboardData: DashboardData = {
  summary: {
    meetingsUnderway: 0,
    uniqueUsers: 11,
    avgMeetingLengthMinutes: 50,
    busiestTime: "11 am",
  },

  updates: {
    latestVersion: "Mersive v1.0.1",
    releaseDate: "Apr 10, 2024",
    releaseNotes: [
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
    ],
    releaseNotesUrl: "/release-notes",
  },

  faqs: [
    {
      id: 1,
      question: "How can I activate a device?",
      answer:
        "Go to Devices → Select your device → Click Activate and follow the instructions.",
    },
    {
      id: 2,
      question:
        "What network settings are needed for WebRTC sharing?",
      answer:
        "Ensure ports 443 (HTTPS) and 3478 (STUN/TURN) are open and firewall allows outbound traffic.",
    },
    {
      id: 3,
      question: "Where can I purchase add-ons?",
      answer:
        "You can purchase add-ons from the Billing section in your dashboard.",
    },
    {
      id: 4,
      question: "What is Infinite Routing?",
      answer:
        "Infinite Routing allows flexible and intelligent routing of meetings across devices.",
    },
  ],

  deviceBreakdown: {
    totalDevices: 500,

    deviceType: [
      { name: "Gen4 Pod", value: 250 },
      { name: "Gen4 Mini", value: 40 },
      { name: "Gen4 Smart", value: 100 },
      { name: "Gen3 Pod", value: 100 },
      { name: "Gen3 Element", value: 5 },
      { name: "Gen2i Pod", value: 5 },
    ],

    deviceStatus: [
      { name: "Online", value: 214 },
      { name: "In use", value: 178 },
      { name: "Offline", value: 50 },
    ],

    planType: [
      { name: "Pro - 5 year", value: 214 },
      { name: "Pro EDU", value: 178 },
      { name: "Smart - 1 year", value: 50 },
      { name: "Pro - 3 year", value: 214 },
      { name: "Essentials EDU", value: 178 },
      { name: "Smart - 3 year", value: 50 },
    ],

    fleetHealth: {
      healthScore: 7.2,
      onlineDevices: 200,
      devicesWithIssues: 14,
    },
  },
};