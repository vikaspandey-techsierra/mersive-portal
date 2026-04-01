import { renderHook, waitFor } from "@testing-library/react";

const mockGetSnapshotMetric = jest.fn();
const mockSnapshotCloudFunction = jest.fn();

jest.mock("@/lib/analytics/snapshot/snapshotManager", () => ({
  getSnapshotMetric: (...args: any[]) => mockGetSnapshotMetric(...args),
}));

jest.mock("@/lib/analytics/mock/snapshotMock", () => ({
  mockSnapshotCloudFunction: (...args: any[]) =>
    mockSnapshotCloudFunction(...args),
  fleetHealthMock: [
    {
      org_id: "test-org-1000",
      metric_name: "cs_overall_fleet_health",
      segment_1_name: "Device Health Type",
      segment_1_value: "All devices",
      metric_value: "496",
      devices_list: null,
      created_at: "2026-03-12 04:04:58.718413 UTC",
    },
    {
      org_id: "test-org-1000",
      metric_name: "cs_overall_fleet_health",
      segment_1_name: "Device Health Type",
      segment_1_value: "Devices with issues",
      metric_value: "355",
      devices_list: null,
      created_at: "2026-03-12 04:04:58.718413 UTC",
    },
  ],
}));

const deviceTypeRows = [
  {
    org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9",
    metric_name: "cs_devices_num_by_type",
    segment_1_name: "Device Type",
    segment_1_value: "Gen 4 Smart",
    metric_value: "2",
    devices_list: null,
    created_at: "2026-03-05 03:00:03",
  },
  {
    org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9",
    metric_name: "cs_devices_num_by_type",
    segment_1_name: "Device Type",
    segment_1_value: "Gen 4 Pod",
    metric_value: "1",
    devices_list: null,
    created_at: "2026-03-05 03:00:03",
  },
  {
    org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9",
    metric_name: "cs_devices_num_by_type",
    segment_1_name: "Device Type",
    segment_1_value: "Gen 3 Pod",
    metric_value: "5",
    devices_list: null,
    created_at: "2026-03-05 03:00:03",
  },
];

const deviceStatusRows = [
  {
    org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9",
    metric_name: "cs_devices_num_by_status",
    segment_1_name: "Device Status",
    segment_1_value: "Offline",
    metric_value: "2",
    devices_list: null,
    created_at: "2026-03-05 02:59:39",
  },
  {
    org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9",
    metric_name: "cs_devices_num_by_status",
    segment_1_name: "Device Status",
    segment_1_value: "Online",
    metric_value: "1",
    devices_list: null,
    created_at: "2026-03-05 02:59:39",
  },
];

const planTypeRows = [
  {
    org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9",
    metric_name: "cs_devices_num_by_plan",
    segment_1_name: "Plan Type",
    segment_1_value: "Dev Smart - 1 year",
    metric_value: "2",
    devices_list: null,
    created_at: "2026-03-05 02:57:59",
  },
  {
    org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9",
    metric_name: "cs_devices_num_by_plan",
    segment_1_name: "Plan Type",
    segment_1_value: "Dev Pro - 1 year",
    metric_value: "1",
    devices_list: null,
    created_at: "2026-03-05 02:57:59",
  },
];

import {
  useDeviceTypeMetric,
  useDeviceStatusMetric,
  usePlanTypeMetric,
  useFleetHealthMetric,
  useOfflineDevicesMetric,
  useExpiredDevicesMetric,
  useOutdatedFirmwareMetric,
  useOtherIssuesMetric,
  useMeetingsUnderwayMetric,
  useActiveDevicesMetric,
  useAvgMeetingLengthMetric,
  useBusiestTimeMetric,
} from "@/lib/analytics/hooks/useSnapshotMetric";

beforeEach(() => {
  jest.clearAllMocks();
  // Set default mock returns
  mockGetSnapshotMetric.mockResolvedValue([]);
  mockSnapshotCloudFunction.mockResolvedValue([]);
});

describe("useDeviceTypeMetric", () => {
  it("starts in loading state", () => {
    mockGetSnapshotMetric.mockResolvedValue(deviceTypeRows);
    const { result } = renderHook(() => useDeviceTypeMetric("test-org"));
    expect(result.current.loading).toBe(true);
  });

  it("resolves with parsed chart data", async () => {
    mockGetSnapshotMetric.mockResolvedValue(deviceTypeRows);
    const { result } = renderHook(() => useDeviceTypeMetric("test-org"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data[0]).toMatchObject({
      name: "Gen 4 Smart",
      value: 2,
    });
    expect(result.current.data[1]).toMatchObject({
      name: "Gen 4 Pod",
      value: 1,
    });
    expect(result.current.data[2]).toMatchObject({
      name: "Gen 3 Pod",
      value: 5,
    });
  });

  it("exposes createdAt from first row", async () => {
    mockGetSnapshotMetric.mockResolvedValue(deviceTypeRows);
    const { result } = renderHook(() => useDeviceTypeMetric("test-org"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.createdAt).toBe("2026-03-05 03:00:03");
  });

  it("returns empty data when metric returns no rows", async () => {
    mockGetSnapshotMetric.mockResolvedValue([]);
    const { result } = renderHook(() => useDeviceTypeMetric("test-org"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(0);
    expect(result.current.createdAt).toBeUndefined();
  });

  it("calls getSnapshotMetric with correct key", async () => {
    mockGetSnapshotMetric.mockResolvedValue(deviceTypeRows);
    renderHook(() => useDeviceTypeMetric("test-org"));
    await waitFor(() =>
      expect(mockGetSnapshotMetric).toHaveBeenCalledWith(
        "test-org",
        "cs_devices_num_by_type"
      )
    );
  });
});

describe("useDeviceStatusMetric", () => {
  it("starts in loading state", () => {
    mockGetSnapshotMetric.mockResolvedValue(deviceStatusRows);
    const { result } = renderHook(() => useDeviceStatusMetric("test-org"));
    expect(result.current.loading).toBe(true);
  });

  it("resolves with correct data including percentages", async () => {
    mockGetSnapshotMetric.mockResolvedValue(deviceStatusRows);
    const { result } = renderHook(() => useDeviceStatusMetric("test-org"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // total = 3; Offline = 2 (67%), Online = 1 (33%)
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0]).toMatchObject({
      name: "Offline",
      value: 2,
      percent: 67,
    });
    expect(result.current.data[1]).toMatchObject({
      name: "Online",
      value: 1,
      percent: 33,
    });
  });

  it("handles empty rows gracefully", async () => {
    mockGetSnapshotMetric.mockResolvedValue([]);
    const { result } = renderHook(() => useDeviceStatusMetric("test-org"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(0);
  });
});

describe("usePlanTypeMetric", () => {
  it("resolves with correct plan data", async () => {
    mockGetSnapshotMetric.mockResolvedValue(planTypeRows);
    const { result } = renderHook(() => usePlanTypeMetric("test-org"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0]).toMatchObject({
      name: "Dev Smart - 1 year",
      value: 2,
      percent: 67,
    });
    expect(result.current.data[1]).toMatchObject({
      name: "Dev Pro - 1 year",
      value: 1,
      percent: 33,
    });
  });

  it("calls getSnapshotMetric with correct key", async () => {
    mockGetSnapshotMetric.mockResolvedValue(planTypeRows);
    renderHook(() => usePlanTypeMetric("test-org"));
    await waitFor(() =>
      expect(mockGetSnapshotMetric).toHaveBeenCalledWith(
        "test-org",
        "cs_devices_num_by_plan"
      )
    );
  });
});

describe("useFleetHealthMetric", () => {
  const fleetHealthRows = [
    {
      org_id: "test-org",
      metric_name: "cs_overall_fleet_health",
      segment_1_name: "Device Health Type",
      segment_1_value: "All devices",
      metric_value: "496",
      devices_list: null,
      created_at: "2026-03-12 04:04:58.718413 UTC",
    },
    {
      org_id: "test-org",
      metric_name: "cs_overall_fleet_health",
      segment_1_name: "Device Health Type",
      segment_1_value: "Devices with issues",
      metric_value: "355",
      devices_list: null,
      created_at: "2026-03-12 04:04:58.718413 UTC",
    },
  ];

  it("calculates score correctly from mock data", async () => {
    // Mock Math.random to return 0 so no random adjustment
    const mockMathRandom = jest.spyOn(Math, "random");
    mockMathRandom.mockReturnValue(0);

    mockSnapshotCloudFunction.mockResolvedValue(fleetHealthRows);
    const { result } = renderHook(() => useFleetHealthMetric("test-org"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // The hook calculates score as: ((totalDevices - devicesWithIssues) * 10) / totalDevices
    // and then does .toFixed(1) which returns a string, but the state stores it as number
    const totalDevices = 496;
    const devicesWithIssues = 355;
    const expectedScore = Number(
      (((totalDevices - devicesWithIssues) * 10) / totalDevices).toFixed(1)
    );

    expect(result.current.data.score).toBe(expectedScore);
    expect(result.current.data.totalDevices).toBe(496); // No random adjustment
    expect(result.current.data.devicesWithIssues).toBe(355);

    mockMathRandom.mockRestore();
  });

  it("returns correct totalDevices with random adjustment", async () => {
    // Mock Math.random to return 0.5, which gives Math.floor(0.5 * 3) = 1
    const mockMathRandom = jest.spyOn(Math, "random");
    mockMathRandom.mockReturnValue(0.5);

    mockSnapshotCloudFunction.mockResolvedValue(fleetHealthRows);
    const { result } = renderHook(() => useFleetHealthMetric("test-org"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // With randomAdjust = 1
    expect(result.current.data.totalDevices).toBe(497);
    expect(result.current.data.devicesWithIssues).toBe(355);

    mockMathRandom.mockRestore();
  });

  it("returns correct devicesWithIssues", async () => {
    // Mock Math.random to return 0 for consistent testing
    const mockMathRandom = jest.spyOn(Math, "random");
    mockMathRandom.mockReturnValue(0);

    mockSnapshotCloudFunction.mockResolvedValue(fleetHealthRows);
    const { result } = renderHook(() => useFleetHealthMetric("test-org"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data.devicesWithIssues).toBe(355);

    mockMathRandom.mockRestore();
  });

  it("handles missing data gracefully", async () => {
    // Mock Math.random to return 0 so no random adjustment
    const mockMathRandom = jest.spyOn(Math, "random");
    mockMathRandom.mockReturnValue(0);

    mockSnapshotCloudFunction.mockResolvedValue([]);
    const { result } = renderHook(() => useFleetHealthMetric("test-org"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    // When no data, totalDevices and devicesWithIssues are 0
    // Score calculation: totalDevices > 0 ? ... : 0
    // So score should be 0
    expect(result.current.data.score).toBe(0);
    // totalDevices = 0 + randomAdjust (which is 0) = 0
    expect(result.current.data.totalDevices).toBe(0);
    expect(result.current.data.devicesWithIssues).toBe(0);

    mockMathRandom.mockRestore();
  });
});

describe("useOfflineDevicesMetric", () => {
  it("returns numeric value from metric row", async () => {
    mockGetSnapshotMetric.mockResolvedValue([
      { metric_value: "7", created_at: "" },
    ]);
    const { result } = renderHook(() => useOfflineDevicesMetric("test-org"));
    await waitFor(() => expect(result.current).toBe(7));
  });

  it("returns 0 when rows are empty", async () => {
    mockGetSnapshotMetric.mockResolvedValue([]);
    const { result } = renderHook(() => useOfflineDevicesMetric("test-org"));
    await waitFor(() =>
      expect(mockGetSnapshotMetric).toHaveBeenCalledWith(
        "test-org",
        "cs_offline_devices_num"
      )
    );
    expect(result.current).toBe(0);
  });
});

describe("useExpiredDevicesMetric", () => {
  it("returns correct value", async () => {
    mockGetSnapshotMetric.mockResolvedValue([{ metric_value: "5" }]);
    const { result } = renderHook(() => useExpiredDevicesMetric("test-org"));
    await waitFor(() => expect(result.current).toBe(5));
  });
});

describe("useOutdatedFirmwareMetric", () => {
  it("returns correct value", async () => {
    mockGetSnapshotMetric.mockResolvedValue([{ metric_value: "3" }]);
    const { result } = renderHook(() => useOutdatedFirmwareMetric("test-org"));
    await waitFor(() => expect(result.current).toBe(3));
  });
});

describe("useOtherIssuesMetric", () => {
  it("returns correct value", async () => {
    mockGetSnapshotMetric.mockResolvedValue([{ metric_value: "2" }]);
    const { result } = renderHook(() => useOtherIssuesMetric("test-org"));
    await waitFor(() => expect(result.current).toBe(2));
  });
});

describe("useMeetingsUnderwayMetric", () => {
  it("returns correct meetings count", async () => {
    mockGetSnapshotMetric.mockResolvedValue([{ metric_value: "12" }]);
    const { result } = renderHook(() => useMeetingsUnderwayMetric("test-org"));
    await waitFor(() => expect(result.current).toBe(12));
  });
});

describe("useActiveDevicesMetric", () => {
  it("returns correct active device count", async () => {
    mockGetSnapshotMetric.mockResolvedValue([{ metric_value: "45" }]);
    const { result } = renderHook(() => useActiveDevicesMetric("test-org"));
    await waitFor(() => expect(result.current).toBe(45));
  });
});

describe("useAvgMeetingLengthMetric", () => {
  it("returns correct average duration", async () => {
    mockGetSnapshotMetric.mockResolvedValue([{ metric_value: "38" }]);
    const { result } = renderHook(() => useAvgMeetingLengthMetric("test-org"));
    await waitFor(() => expect(result.current).toBe(38));
  });
});

describe("useBusiestTimeMetric", () => {
  it("returns correct busiest time label", async () => {
    mockGetSnapshotMetric.mockResolvedValue([
      { metric_value: "10:00 AM - 11:00 AM" },
    ]);
    const { result } = renderHook(() => useBusiestTimeMetric("test-org"));
    await waitFor(() => expect(result.current).toBe("10:00 AM - 11:00 AM"));
  });

  it("returns empty string when no rows", async () => {
    mockGetSnapshotMetric.mockResolvedValue([]);
    const { result } = renderHook(() => useBusiestTimeMetric("test-org"));
    await waitFor(() =>
      expect(mockGetSnapshotMetric).toHaveBeenCalledWith(
        "test-org",
        "agg_busiest_time"
      )
    );
    expect(result.current).toBe("");
  });
});
