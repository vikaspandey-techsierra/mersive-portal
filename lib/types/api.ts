// ============================================================
// API TYPES — Replace dummy data with real API responses
// ============================================================

export interface DashboardStats {
  meetingsUnderway: number;
  uniqueUsers: number;
  avgMeetingLengthMin: number;
  busiestTimeLabel: string;
}

export interface AdminAlert {
  offlineDevices: number;
  expiredOrExpiringSoon: number;
  outdatedFirmware: number;
  otherIssues: number;
}

export interface ReleaseNote {
  version: string;
  date: string; // ISO string
  bullets: string[];
}

export interface FaqItem {
  question: string;
}

export interface DeviceTypeBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface DeviceStatusBreakdown {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface PlanTypeBreakdown {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface FleetHealth {
  score: number; // 0–10
  onlineDevices: number;
  devicesWithIssues: number;
}

export interface DeviceBreakdownSnapshot {
  asOf: string; // ISO string
  totalDevices: number;
  byType: DeviceTypeBreakdown[];
  byStatus: DeviceStatusBreakdown[];
  byPlan: PlanTypeBreakdown[];
  fleetHealth: FleetHealth;
}

export interface DashboardApiResponse {
  stats: DashboardStats;
  alert: AdminAlert;
  latestRelease: ReleaseNote;
  faqs: FaqItem[];
  deviceBreakdown: DeviceBreakdownSnapshot;
}