


import { AlertHistoryPoint } from "@/components/AlertGraph";

export const MOCK_ALERT_HISTORY: Record<string, AlertHistoryPoint[]> = {
  "7d": [
    { date: "2024-12-16", unreachable: 5, rebooted: 4, unassignedFromTemplate: 1, updateAvailable: 1, updateCompleted: 1 },
    { date: "2024-12-17", unreachable: 6, rebooted: 4, unassignedFromTemplate: 2, updateAvailable: 1, updateCompleted: 1 },
    { date: "2024-12-18", unreachable: 1, rebooted: 1, unassignedFromTemplate: 0, updateAvailable: 0, updateCompleted: 0 },
    { date: "2024-12-19", unreachable: 8, rebooted: 5, unassignedFromTemplate: 3, updateAvailable: 2, updateCompleted: 1 },
    { date: "2024-12-20", unreachable: 9, rebooted: 7, unassignedFromTemplate: 4, updateAvailable: 2, updateCompleted: 1 },
    { date: "2024-12-21", unreachable: 4, rebooted: 3, unassignedFromTemplate: 1, updateAvailable: 1, updateCompleted: 1 },
    { date: "2024-12-22", unreachable: 1, rebooted: 1, unassignedFromTemplate: 0, updateAvailable: 0, updateCompleted: 0 },
  ],

  "30d": Array.from({ length: 30 }, (_, i) => {
    const d = new Date("2024-11-23");
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      unreachable:            Math.floor(Math.random() * 10),
      rebooted:               Math.floor(Math.random() * 8),
      unassignedFromTemplate: Math.floor(Math.random() * 5),
      updateAvailable:        Math.floor(Math.random() * 4),
      updateCompleted:        Math.floor(Math.random() * 3),
    };
  }),

  "60d": Array.from({ length: 60 }, (_, i) => {
    const d = new Date("2024-10-24");
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      unreachable:            Math.floor(Math.random() * 12),
      rebooted:               Math.floor(Math.random() * 9),
      unassignedFromTemplate: Math.floor(Math.random() * 6),
      updateAvailable:        Math.floor(Math.random() * 5),
      updateCompleted:        Math.floor(Math.random() * 4),
    };
  }),

  "90d": Array.from({ length: 90 }, (_, i) => {
    const d = new Date("2024-09-24");
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      unreachable:            Math.floor(Math.random() * 15),
      rebooted:               Math.floor(Math.random() * 10),
      unassignedFromTemplate: Math.floor(Math.random() * 7),
      updateAvailable:        Math.floor(Math.random() * 6),
      updateCompleted:        Math.floor(Math.random() * 5),
    };
  }),

  "all": Array.from({ length: 180 }, (_, i) => {
    const d = new Date("2024-07-01");
    d.setDate(d.getDate() + i);
    return {
      date: d.toISOString().slice(0, 10),
      unreachable:            Math.floor(Math.random() * 18),
      rebooted:               Math.floor(Math.random() * 12),
      unassignedFromTemplate: Math.floor(Math.random() * 8),
      updateAvailable:        Math.floor(Math.random() * 7),
      updateCompleted:        Math.floor(Math.random() * 6),
    };
  }),
};