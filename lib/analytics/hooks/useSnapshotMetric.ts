"use client";

import { useEffect, useState } from "react";
import { getSnapshotMetric } from "../snapshot/snapshotManager";
import { parseSnapshot } from "../snapshot/snapshotParser";
import {
  ChartData,
  DeviceStatusData,
  PlanTypeData,
  FleetHealthData
} from "../snapshot/snapshotTypes";


// DEVICE TYPE
export function useDeviceTypeMetric() {

  const [data, setData] = useState<ChartData[]>([]);
  const [createdAt, setCreatedAt] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadMetric() {

      const rows = await getSnapshotMetric("cs_devices_num_by_type");

      const parsed = parseSnapshot(rows);

      setData(parsed);
      setCreatedAt(rows?.[0]?.created_at);

      setLoading(false);
    }

    loadMetric();

  }, []);

  return { data, createdAt, loading };

}

// DEVICE STATUS
export function useDeviceStatusMetric() {

  const [data, setData] = useState<DeviceStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadMetric() {

      const rows = await getSnapshotMetric("cs_devices_num_by_status");

      const parsed = parseSnapshot(rows);

      const total = parsed.reduce((sum, r) => sum + r.value, 0);

      const processed = parsed.map((r) => ({
        name: r.name,
        value: r.value,
        percent: total ? Math.round((r.value / total) * 100) : 0
      }));

      setData(processed);

      setLoading(false);

    }

    loadMetric();

  }, []);

  return { data, loading };

}

// PLAN TYPE
export function usePlanTypeMetric() {

  const [data, setData] = useState<PlanTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadMetric() {

      const rows = await getSnapshotMetric("cs_devices_num_by_plan");

      const parsed = parseSnapshot(rows);

      const total = parsed.reduce((sum, r) => sum + r.value, 0);

      const processed = parsed.map((r) => ({
        name: r.name,
        value: r.value,
        percent: total ? Math.round((r.value / total) * 100) : 0
      }));

      setData(processed);

      setLoading(false);

    }

    loadMetric();

  }, []);

  return { data, loading };

}

// FLEET HEALTH
export function useFleetHealthMetric() {

  const [data, setData] = useState<FleetHealthData>({
    score: 0,
    onlineDevices: 0,
    devicesWithIssues: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadMetric() {

      const rows = await getSnapshotMetric("cs_devices_num_by_status");

      const parsed = parseSnapshot(rows);

      const online = parsed.find((r) => r.name === "Online")?.value ?? 0;
      const offline = parsed.find((r) => r.name === "Offline")?.value ?? 0;
      const inUse = parsed.find((r) => r.name === "In use")?.value ?? 0;

      const totalDevices = online + offline + inUse;

      const healthScore = totalDevices
        ? Number(((online / totalDevices) * 10).toFixed(1))
        : 0;

      setData({
        score: healthScore,
        onlineDevices: online,
        devicesWithIssues: offline
      });

      setLoading(false);

    }

    loadMetric();

  }, []);

  return { data, loading };

}