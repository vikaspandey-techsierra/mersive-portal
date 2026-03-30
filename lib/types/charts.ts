import { ReactNode } from "react";

export interface TooltipEntry {
  dataKey: string;
  name?: string;
  value: number;
  color?: string;
  stroke?: string;
  fill?: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  labelMap?: Record<string, string>;
  formatValue?: (value: number, dataKey: string) => string;
}

export interface DeviceUtilizationProps {
  orgId: string;
  timeRange: string;
  selectedDevices: Set<string>;
}

export type DeviceMetric =
  | "meetings"
  | "hours"
  | "connections"
  | "posts"
  | "avgLength";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
}

export interface MetricDropdownProps<T extends string = string> {
  value: T | null;
  options: DropdownOption<T>[];
  color: string;
  onChange: (value: T | null) => void;
  disabledValue?: T | null;
  showNone?: boolean;
  placeholder?: string;
}

export interface DropdownRowProps {
  label: string;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

export interface AxisLabelProps {
  viewBox?: { x: number; y: number; width: number; height: number };
  label: string;
  color?: string;
  offset?: number;
}

export interface TEntry {
  name: string;
  value: number;
  color: string;
}

export type ChartRow = { label: string; [key: string]: string | number };

export interface DowntimeChartProps {
  orgId: string; // ✅ added
  timeRange: string;
  selectedDevices: Set<string>;
  interval?: number;
}

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  width?: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
  sortable?: boolean;
  cellClassName?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  loadingLabel?: string;
  emptyMessage?: string;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  rowKey?: (row: T, index: number) => string;
  onSelectionChange?: (keys: Set<string>) => void;
  maxHeight?: string;
  className?: string;
}

export type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";

export interface AnalyticsPageProps {
  tableRef?: React.Ref<SelectableDataTableHandle>;
  orgId: string; // ✅ required now
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export interface SummaryCardProps {
  meetingsUnderway: number;
  activeUsers: number;
  avgMeetingLengthMinutes: number;
  busiestTime: string;
}

export interface UpdatesSectionProps {
  latestVersion: string;
  releaseDate: string;
  releaseNotes: string[];
}

export interface AlertChipProps {
  icon: string;
  label: string;
  value: number;
  iconColor?: string;
  className?: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  bullets: string[];
}

export interface FaqItem {
  question: string;
  answer?: string;
  link?: string;
}

export interface AlertChartProps {
  orgId: string;
  timeRange: string;
  selectedDevices: Set<string>;
  interval?: number;
}

export interface CardProps {
  title: string;
  children: React.ReactNode;
  icon: string;
}

export type SortDir = "asc" | "desc";

export interface ColumnDef<T extends Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  csvValue?: (value: T[keyof T], row: T) => string | number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  cellClassName?: string;
}

export interface SelectableDataTableProps<T extends Record<string, unknown>> {
  heading: string;
  subheading: string;
  searchPlaceholder?: string;
  rows?: T[];
  rowKey: keyof T & string;
  columns: ColumnDef<T>[];
  defaultSortKey?: keyof T & string;
  defaultSortDir?: SortDir;
  defaultAllSelected?: boolean;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  timeRange?: string;
  isLoading?: boolean;
  csvFilename?: string;
}

export interface SelectableDataTableHandle {
  exportCSV: () => void;
}

export interface DeviceTableRow extends Record<string, unknown> {
  id: string;
  name: string;
  meetings: number | null;
  totalConnections: number | null;
  hoursInUse: number | null;
  contentItems: number | null;
  avgDuration: string | null;
  avgDurationMinutes: number | null;
}

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export interface SortProps {
  active: boolean;
  dir: SortDir;
}

export interface UserConnectionsProp {
  orgId: string;
  timeRange?: string;
  title: string;
  subtitle?: string;
  selectedDevices: Set<string>;
}

export interface TimeseriesRow {
  aggregation_level: string;
  metric_name: string;
  segment_1_name: string | null;
  segment_1_value: string | null;
  date: string;
  org_id: string;
  device_name: string | null;
  metric_value: string;
}

export type AlertDataPoint = {
  date: string;
} & Record<string, number | string>;
