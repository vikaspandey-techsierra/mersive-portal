import { DeviceEvent } from "./analyticsTypes";

export const deviceEvents: DeviceEvent[] = Array.from({ length: 5000 }).map(
  (_, i) => ({
    deviceId: `PD-${i % 40}`,
    deviceName: ["Board Room", "Hallway", "John’s Office", "Corner Conf"][i % 4],
    deviceType: ["Gen4 Pod", "Gen4 Mini", "Gen4 Smart"][i % 3] as any,
    protocol: ["Web", "AirPlay", "Miracast", "Google Cast", "HDMI"][i % 5] as any,
    os: ["MacOS", "Windows", "iOS", "Android"][i % 4] as any,
    conference: ["Teams", "Zoom", "Presentation Only"][i % 3] as any,
    mode: ["Wireless", "Wired"][i % 2] as any,
    meetingId: `MT-${i % 300}`,
    userId: `USR-${i % 600}`,
    durationMin: Math.floor(Math.random() * 120),
    posts: Math.floor(Math.random() * 10),
    day: `Dec ${16 + (i % 7)}`,
  })
);
