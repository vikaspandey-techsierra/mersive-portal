import { TimeseriesRow } from "../timeseries/timeseriesTypes";

// Real sample data from API 
export const timeseriesMock: TimeseriesRow[] = [

  // ts_meetings_num 
  { aggregation_level: "Day", metric_name: "ts_meetings_num", segment_1_name: null, segment_1_value: null, date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "10" },
  { aggregation_level: "Day", metric_name: "ts_meetings_num", segment_1_name: null, segment_1_value: null, date: "2026-03-02", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "1" },
  { aggregation_level: "Day", metric_name: "ts_meetings_num", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "9" },
  { aggregation_level: "Day", metric_name: "ts_meetings_num", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "11" },

  // ts_connections_num
  { aggregation_level: "Day", metric_name: "ts_connections_num", segment_1_name: null, segment_1_value: null, date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "8" },
  { aggregation_level: "Day", metric_name: "ts_connections_num", segment_1_name: null, segment_1_value: null, date: "2026-03-02", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "1" },
  { aggregation_level: "Day", metric_name: "ts_connections_num", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "7" },
  { aggregation_level: "Day", metric_name: "ts_connections_num", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "11" },

  // ts_posts_num
  { aggregation_level: "Day", metric_name: "ts_posts_num", segment_1_name: null, segment_1_value: null, date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "8" },
  { aggregation_level: "Day", metric_name: "ts_posts_num", segment_1_name: null, segment_1_value: null, date: "2026-03-02", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "4" },
  { aggregation_level: "Day", metric_name: "ts_posts_num", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "8" },
  { aggregation_level: "Day", metric_name: "ts_posts_num", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "21" },

  // ts_meetings_duration_tot
  { aggregation_level: "Day", metric_name: "ts_meetings_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "6.622932222" },
  { aggregation_level: "Day", metric_name: "ts_meetings_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-02", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "0.481286111" },
  { aggregation_level: "Day", metric_name: "ts_meetings_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "3.821316667" },
  { aggregation_level: "Day", metric_name: "ts_meetings_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "3.331328056" },

  // ts_downtime_duration_tot
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "51.876666666" },
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-02-28", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "46.811388889" },
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-01", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "48" },
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-02", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "83.800277778" },
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "39.778888889" },
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: "local",  metric_value: "1.956111111" },
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "35.020555556" },
  { aggregation_level: "Day", metric_name: "ts_downtime_duration_tot", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: "local",  metric_value: "2.0925" },

  // ts_app_alerts_unreachable_num
  { aggregation_level: "Day", metric_name: "ts_app_alerts_unreachable_num", segment_1_name: null, segment_1_value: null, date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "72" },
  { aggregation_level: "Day", metric_name: "ts_app_alerts_unreachable_num", segment_1_name: null, segment_1_value: null, date: "2026-02-28", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "8" },
  { aggregation_level: "Day", metric_name: "ts_app_alerts_unreachable_num", segment_1_name: null, segment_1_value: null, date: "2026-03-02", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "16" },
  { aggregation_level: "Day", metric_name: "ts_app_alerts_unreachable_num", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "34" },
  { aggregation_level: "Day", metric_name: "ts_app_alerts_unreachable_num", segment_1_name: null, segment_1_value: null, date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: "local",  metric_value: "11" },
  { aggregation_level: "Day", metric_name: "ts_app_alerts_unreachable_num", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null,    metric_value: "36" },
  { aggregation_level: "Day", metric_name: "ts_app_alerts_unreachable_num", segment_1_name: null, segment_1_value: null, date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: "local",  metric_value: "6" },

  // ts_connections_num_by_os
  { aggregation_level: "Day", metric_name: "ts_connections_num_by_os", segment_1_name: "OS", segment_1_value: "Linux", date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "1" },
  { aggregation_level: "Day", metric_name: "ts_connections_num_by_os", segment_1_name: "OS", segment_1_value: "Linux", date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "1" },
  { aggregation_level: "Day", metric_name: "ts_connections_num_by_os", segment_1_name: "OS", segment_1_value: "MacOS", date: "2026-02-27", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "7" },
  { aggregation_level: "Day", metric_name: "ts_connections_num_by_os", segment_1_name: "OS", segment_1_value: "MacOS", date: "2026-03-02", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "1" },
  { aggregation_level: "Day", metric_name: "ts_connections_num_by_os", segment_1_name: "OS", segment_1_value: "MacOS", date: "2026-03-03", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "7" },
  { aggregation_level: "Day", metric_name: "ts_connections_num_by_os", segment_1_name: "OS", segment_1_value: "MacOS", date: "2026-03-04", org_id: "aVRMM99r6Q6KdR5Bu3gB-7m0i9", device_name: null, metric_value: "10" },

];