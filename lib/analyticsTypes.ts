export type DeviceEvent = {
  deviceId: string;
  deviceName: string;
  deviceType: "Gen4 Pod" | "Gen4 Mini" | "Gen4 Smart";
  protocol: "Web" | "AirPlay" | "Miracast" | "Google Cast" | "HDMI";
  os: "MacOS" | "Windows" | "iOS" | "Android";
  conference: "Teams" | "Zoom" | "Presentation Only";
  mode: "Wireless" | "Wired";
  meetingId: string;
  userId: string;
  durationMin: number;
  posts: number;
  day: string;
};
