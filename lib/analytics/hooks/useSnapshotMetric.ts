"use client";

import { useEffect, useState } from "react";
import { getSnapshotMetric } from "../snapshot/snapshotManager";
import { parseSnapshot } from "../snapshot/snapshotParser";
import {
  ChartData,
  DeviceStatusData,
  PlanTypeData,
  FleetHealthData,
  FleetHealthRow,
} from "../snapshot/snapshotTypes";
import { fleetHealthMock } from "../mock/snapshotMock";

//  DEVICE TYPE
export function useDeviceTypeMetric(refreshKey?: number) {
  const [data, setData] = useState<ChartData[]>([]);
  const [createdAt, setCreatedAt] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetric() {
      setLoading(true);

      const rows = await getSnapshotMetric("cs_devices_num_by_type");
      const parsed = parseSnapshot(rows);

      setData(parsed);
      setCreatedAt(rows?.[0]?.created_at);
      setLoading(false);
    }

    loadMetric();
  }, [refreshKey]);

  return { data, createdAt, loading };
}

// DEVICE STATUS
export function useDeviceStatusMetric(refreshKey?: number) {
  const [data, setData] = useState<DeviceStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetric() {
      setLoading(true);

      const rows = await getSnapshotMetric("cs_devices_num_by_status");
      const parsed = parseSnapshot(rows);

      const total = parsed.reduce((sum, r) => sum + r.value, 0);

      const processed = parsed.map((r) => ({
        name: r.name,
        value: r.value,
        percent: total ? Math.round((r.value / total) * 100) : 0,
      }));

      setData(processed);
      setLoading(false);
    }

    loadMetric();
  }, [refreshKey]);

  return { data, loading };
}

// PLAN TYPE
export function usePlanTypeMetric(refreshKey?: number) {
  const [data, setData] = useState<PlanTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetric() {
      setLoading(true);

      const rows = await getSnapshotMetric("cs_devices_num_by_plan");
      const parsed = parseSnapshot(rows);

      const total = parsed.reduce((sum, r) => sum + r.value, 0);

      const processed = parsed.map((r) => ({
        name: r.name,
        value: r.value,
        percent: total ? Math.round((r.value / total) * 100) : 0,
      }));

      setData(processed);
      setLoading(false);
    }

    loadMetric();
  }, [refreshKey]);

  return { data, loading };
}

// FLEET HEALTH
export function useFleetHealthMetric(refreshKey?: number) {
  const [data, setData] = useState<FleetHealthData>({
    score: 0,
    totalDevices: 0,
    devicesWithIssues: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetric() {
      setLoading(true);

      // Using mock
      const rows: FleetHealthRow[] = fleetHealthMock;

      const allDevicesRow = rows.find(
        (r) => r.segment_1_value === "All devices"
      );
      const issuesRow = rows.find(
        (r) => r.segment_1_value === "Devices with issues"
      );

      const totalDevices = Number(allDevicesRow?.metric_value ?? 0);
      const devicesWithIssues = Number(issuesRow?.metric_value ?? 0);

      const score =
        totalDevices > 0
          ? Number(
              (
                ((totalDevices - devicesWithIssues) * 10) /
                totalDevices
              ).toFixed(1)
            )
          : 0;

      // simulate new data on refresh (so you can see refresh working)
      const randomAdjust = Math.floor(Math.random() * 3);

      setData({
        score,
        totalDevices: totalDevices + randomAdjust,
        devicesWithIssues,
      });

      setLoading(false);
    }

    loadMetric();
  }, [refreshKey]); // ← THIS is why refresh will work

  return { data, loading };
}

// BANNER METRICS
export function useOfflineDevicesMetric() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("cs_offline_devices_num");

      setValue(Number(rows?.[0]?.metric_value ?? 0));
    }

    load();
  }, []);

  return value;
}

export function useExpiredDevicesMetric() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("cs_expired_and_soon_devices_num");

      setValue(Number(rows?.[0]?.metric_value ?? 0));
    }

    load();
  }, []);

  return value;
}

export function useOutdatedFirmwareMetric() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("cs_outdated_firmware_devices_num");

      setValue(Number(rows?.[0]?.metric_value ?? 0));
    }

    load();
  }, []);

  return value;
}

export function useOtherIssuesMetric() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("cs_other_issues_devices_num");

      setValue(Number(rows?.[0]?.metric_value ?? 0));
    }

    load();
  }, []);

  return value;
}

// STATS CARDS
export function useMeetingsUnderwayMetric() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("cs_meetings_num");

      setValue(Number(rows?.[0]?.metric_value ?? 0));
    }

    load();
  }, []);

  return value;
}

export function useActiveDevicesMetric() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("agg_active_devices_num");

      setValue(Number(rows?.[0]?.metric_value ?? 0));
    }

    load();
  }, []);

  return value;
}

export function useAvgMeetingLengthMetric() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("agg_meetings_duration_avg");

      setValue(Number(rows?.[0]?.metric_value ?? 0));
    }

    load();
  }, []);

  return value;
}

export function useBusiestTimeMetric() {
  const [value, setValue] = useState("");

  useEffect(() => {
    async function load() {
      const rows = await getSnapshotMetric("agg_busiest_time");

      setValue(rows?.[0]?.metric_value ?? "");
    }

    load();
  }, []);

  return value;
}
