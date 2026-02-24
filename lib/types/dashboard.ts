// types/dashboard.types.ts

export interface DashboardData {
  lastUpdated: string; // ISO timestamp
  updates: ReleaseNote[];
  deviceBreakdown: DeviceBreakdown;
}

export interface ReleaseNote {
  version: string;
  releaseNotes: string[];
}

export interface DeviceBreakdown {
  deviceTypes: DeviceTypeCount[];
  deviceStatus: DeviceStatusCount[];
  planTypes: PlanTypeCount[];
  fleetHealth: FleetHealth;
}

export interface DeviceTypeCount {
  type: 'Gen4 Pod' | 'Gen4 Mini' | 'Gen4 Smart' | 'Gen3 Pod' | 'Gen3 Element' | 'Gen2i Pod';
  count: number;
}

export interface DeviceStatusCount {
  status: 'Online' | 'In use' | 'Offline';
  count: number;
  percentage: number;
}

export interface PlanTypeCount {
  plan: string;
  count: number;
  percentage: number;
}

export interface FleetHealth {
  healthScore: number;
  devicesWithIssues: number; // or boolean flag
}

// API Response Format
export interface ApiResponse {
  success: boolean;
  data: DashboardData;
  message?: string;
  timestamp: string;
}