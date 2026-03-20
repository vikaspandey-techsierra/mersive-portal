"use client";

import SelectableTable, {
  type ColumnDef,
  type SelectableTableProps,
} from "./SelectableTable";

/* ------------------------------------------------------------------ */
/*  DEFAULT DEVICE TYPE (kept for backward-compatibility)              */
/* ------------------------------------------------------------------ */

export interface Device {
  id: string;
  name: string;
  meetings: number | null;
  totalUsers: number | null;
  hoursInUse: number | null;
  contentItems: number | null;
  avgDuration: string | null;
  avgDurationMinutes: number | null;
  contentTypes: number | null;
}

/* ------------------------------------------------------------------ */
/*  DEFAULT COLUMNS                                                    */
/* ------------------------------------------------------------------ */

const fmt = (v: unknown) => (v === null || v === undefined ? "-" : String(v));

const DEFAULT_COLUMNS: ColumnDef<Device>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "meetings", label: "Meetings", sortable: true, render: (v) => fmt(v) },
  { key: "totalUsers", label: "Total Users", sortable: true, render: (v) => fmt(v) },
  {
    key: "hoursInUse",
    label: "Hours in Use",
    sortable: true,
    render: (v) => (v === null ? "-" : String(v)),
  },
  { key: "contentItems", label: "Content Items", sortable: true, render: (v) => fmt(v) },
  {
    key: "avgDurationMinutes",
    label: "Avg. Duration",
    sortable: true,
    render: (_v, item) => item.avgDuration ?? "-",
  },
  { key: "contentTypes", label: "Content Types", sortable: true, render: (v) => fmt(v) },
];

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const MOCK_DEVICES: Device[] = [
  {
    id: "1",
    name: "Board Room",
    meetings: 2,
    totalUsers: 3,
    hoursInUse: 2,
    contentItems: 1,
    avgDuration: "1 hr",
    avgDurationMinutes: 60,
    contentTypes: 2,
  },
  {
    id: "2",
    name: "Corner Conference",
    meetings: 1,
    totalUsers: 2,
    hoursInUse: 0.5,
    contentItems: 2,
    avgDuration: "30 min",
    avgDurationMinutes: 30,
    contentTypes: 1,
  },
  {
    id: "3",
    name: "Hallway",
    meetings: 1,
    totalUsers: 1,
    hoursInUse: 0.75,
    contentItems: 1,
    avgDuration: "45 min",
    avgDurationMinutes: 45,
    contentTypes: 1,
  },
  {
    id: "4",
    name: "John's Office",
    meetings: 2,
    totalUsers: 1,
    hoursInUse: 4,
    contentItems: 4,
    avgDuration: "2 hrs",
    avgDurationMinutes: 120,
    contentTypes: 3,
  },
  {
    id: "5",
    name: "Temp Office",
    meetings: null,
    totalUsers: null,
    hoursInUse: null,
    contentItems: null,
    avgDuration: null,
    avgDurationMinutes: null,
    contentTypes: null,
  },
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                          */
/* ------------------------------------------------------------------ */

export type SelectedDevicesProps = Partial<
  Omit<SelectableTableProps<Device>, "title">
> & {
  title?: string;
};

/**
 * Pre-configured `SelectableTable` for the Device type.
 *
 * Drop-in replacement for the original `SelectedDevices` component —
 * all props are optional and fall back to the previous defaults.
 *
 * For a fully custom table with a different row type, use
 * `<SelectableTable<YourType> ... />` directly.
 */
export default function SelectedDevices(props: SelectedDevicesProps) {
  const {
    data = MOCK_DEVICES,
    columns = DEFAULT_COLUMNS,
    title = "Selected Devices",
    subtitle = "Select all or narrow the data down to a specific group of devices",
    ...rest
  } = props;

  return (
    <SelectableTable<Device>
      data={data}
      columns={columns}
      title={title}
      subtitle={subtitle}
      {...rest}
    />
  );
}
