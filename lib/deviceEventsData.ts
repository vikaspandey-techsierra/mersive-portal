export const deviceEvents: DeviceEvent[] = Array.from({ length: 10000 }).map(
  (_, i) => ({
    id: `EVT-${i}`,
    deviceId: `PD-${1000 + (i % 50)}`,
    deviceName: ["Board Room", "Hallway", "John’s Office", "Corner Conf"][
      i % 4
    ],
    deviceType: ["Gen4 Pod", "Gen4 Mini", "Gen4 Smart"][i % 3] as any,
    planType: ["Pro-5Y", "Pro-3Y", "Smart-1Y", "Essentials-EDU"][i % 4] as any,
    state: ["Online", "Offline", "In Use"][i % 3] as any,

    meetingId: `MT-${i % 200}`,
    userId: `USR-${i % 500}`,
    os: ["MacOS", "Windows", "iOS", "Android"][i % 4] as any,
    protocol: ["Web", "AirPlay", "Miracast", "Google Cast", "HDMI"][
      i % 5
    ] as any,
    mode: ["Wireless", "Wired"][i % 2] as any,
    conference: ["Teams", "Zoom", "Presentation Only"][i % 3] as any,

    startTime: "2025-12-16T10:00:00Z",
    endTime: "2025-12-16T11:00:00Z",
    durationMin: Math.floor(Math.random() * 120),
    posts: Math.floor(Math.random() * 10),

    eventType: [
      "None",
      "Unreachable",
      "Rebooted",
      "Firmware Update",
      "USB Plugged",
      "USB Unplugged",
    ][i % 6] as any,

    year: 2025,
    month: "Dec",
    day: `Dec ${16 + (i % 7)}`,
  })
);
