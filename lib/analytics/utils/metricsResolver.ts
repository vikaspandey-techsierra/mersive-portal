import { METRIC_FORMULAS } from "./metricsDerived.js"

export const METRIC_DEPENDENCIES: Record<string, string[]> = {
  ts_meetings_duration_avg: [
    "ts_meetings_duration_tot",
    "ts_meetings_num"
  ]
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateMetric(metric: string, metrics: Record<string, any[]>) {

  const formula = METRIC_FORMULAS[metric]

  if (!formula) return null

  return formula(metrics)

}