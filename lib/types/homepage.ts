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