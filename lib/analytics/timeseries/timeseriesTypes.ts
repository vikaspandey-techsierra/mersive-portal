// Raw API / Mock 

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

// Parsed / Chart-ready

export interface ChartPoint {
  date: string;
  value: number;
  segment?: string;
}

export interface ParsedMetric {
  metric: string
  data: ChartPoint[]
}

// Parser output 

// Map of metric_name -> array of chart points (full date range, gaps filled with 0)
export type ParsedMetricsMap = Record<string, ChartPoint[]>

// Store 

// Keys are scoped as `metric_name__timeRange` e.g. "ts_meetings_num__7d"
export type MetricsStore = Record<string, ChartPoint[]>

// Hook return types 
export interface DeviceUtilizationData {
  dataA: ChartPoint[]
  dataB: ChartPoint[]
}

export interface CollaborationUsageData {
  connectionsAvg: ChartPoint[]
  postsAvg: ChartPoint[]
}