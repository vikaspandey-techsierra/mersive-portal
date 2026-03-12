export interface TimeseriesRow {
  aggregation_level: string
  metric_name: string
  segment_1_name: string | null
  segment_1_value: string | null
  date: string
  org_id: string
  device_name: string | null
  metric_value: string
}

export interface ChartPoint {
  date: string
  value: number
}

export interface ParsedMetric {
  metric: string
  data: ChartPoint[]
}