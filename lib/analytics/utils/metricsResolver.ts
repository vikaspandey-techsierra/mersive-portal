import { METRIC_FORMULAS } from "./metricsDerived";

export const METRIC_DEPENDENCIES: Record<string, string[]> = {
  ts_meetings_duration_avg: ["ts_meetings_duration_tot", "ts_meetings_num"],
  ts_meetings_connection_avg: ["ts_meetings_num", "ts_connections_num"],
  ts_meetings_post_avg: ["ts_meetings_num", "ts_posts_num"],
  ts_downtime_devices_num_tot: ["ts_downtime_devices_num"],
};


export function calculateMetric(
  metric: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metrics: Record<string, any[]>
) {
  const formula = METRIC_FORMULAS[metric];

  if (!formula) return null;

  return formula(metrics);
}
