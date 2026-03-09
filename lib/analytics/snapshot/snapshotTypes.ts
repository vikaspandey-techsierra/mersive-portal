export interface SnapshotRow {
  org_id?: string;
  metric_name?: string;
  segment_1_name?: string;
  segment_1_value?: string;
  metric_value: string;
  devices_list?: string[] | null;
  created_at?: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DeviceStatusData extends ChartData {
  percent: number;
}

export interface PlanTypeData extends ChartData {
  percent: number;
}

export interface FleetHealthData {
  score: number;
  onlineDevices: number;
  devicesWithIssues: number;
}