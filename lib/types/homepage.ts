export interface DeviceUtilizationPoint {
  date: string;
  meetings: number;
  connections: number;
}

export interface UserConnectionPoint {
  date: string;
  wireless: number;
  wired: number;
  web: number;
  airplay: number;
  miracast: number;
  googleCast: number;
  hdmiIn: number;
  macos: number;
  windows: number;
  ios: number;
  android: number;
  otherOs: number;
  teams: number;
  zoom: number;
  presentationOnly: number;
}

export interface AlertConfig {
  unreachable: boolean;
  unreachableMinutes: number;
  rebooted: boolean;
  unassignedFromTemplate: boolean;
  firmwareAvailable: boolean;
  firmwareAboutToBegin: boolean;
  firmwareCompleted: boolean;
}

export interface Recipient {
  id: string;
  email: string;
  alerts: AlertConfig;
}

export interface AlertHistoryRow {
  date: string;
  timeAgo: string;
  name: string;
  id: string;
  description: string;
  recipients: string;
}
export interface DeviceStatusItem {
  name: string;
  value: number;
  percent: number;
}

export interface DeviceStatusPieProps {
  data: DeviceStatusItem[];
}

export interface DeviceTypeItem {
  name: string;
  value: number;
}

export interface DeviceTypeDonutProps {
  data: DeviceTypeItem[];
}
export interface FleetHealthGaugeProps {
  score: number;
  totalDevices: number;
  devicesWithIssues: number;
}
export interface PlanTypeItem {
  name: string;
  value: number;
  percent?: number;
}

export interface PlanTypePieProps {
  data: PlanTypeItem[];
}
export interface UpdatesSectionProps {
  updates: {
    latest: Array<{
      version: string;
      releaseNotes: string[];
    }>;
    allReleaseNotesLink: string;
  };
}