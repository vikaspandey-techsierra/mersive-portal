import { DeviceUtilizationPoint, UserConnectionPoint } from "./types/homepage";

export interface AnalyticsApiResponse {
  range: "7d" | "30d" | "60d" | "90d" | "all";
  deviceUtilization: DeviceUtilizationPoint[];
  userConnections: UserConnectionPoint[];
}

// MOCK DATA GENERATOR
export function generateMockData(days: number): AnalyticsApiResponse {
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

export const DAY_COUNTS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 120,
};

export function tickInterval(days: number): number {
  if (days <= 7) return 0;
  if (days <= 30) return 4;
  if (days <= 60) return 8;
  return 13;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}