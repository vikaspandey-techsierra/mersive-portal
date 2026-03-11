// lib/analytics/mock/snapshotMock.ts

import { SnapshotRow } from "../snapshot/snapshotTypes";

export async function mockSnapshotCloudFunction(
  metric: string
): Promise<SnapshotRow[]> {

  const mockDB: Record<string, SnapshotRow[]> = {
  
    cs_devices_num_by_type: [
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
    ],

    cs_devices_num_by_status: [
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
    ],

    cs_devices_num_by_plan: [
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
    ],
    
  };

  return mockDB[metric] ?? [];
}
