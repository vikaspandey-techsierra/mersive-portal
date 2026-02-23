"use client";

import { useState, useMemo } from "react";

/* ================= TYPES ================= */

interface Device {
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

type SortKey =
  | "name"
  | "meetings"
  | "totalUsers"
  | "hoursInUse"
  | "contentItems"
  | "avgDurationMinutes"
  | "contentTypes";

type SortDir = "asc" | "desc";

/* ================= MOCK DATA ================= */

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
    name: "John’s Office",
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

/* ================= HELPERS ================= */

const fmt = (v: number | null) => (v === null ? "-" : String(v));

/* ================= SORT ICON ================= */

const SortIcon = ({
  active,
  dir,
}: {
  active: boolean;
  dir: SortDir;
}) => (
  <span className="ml-1 inline-flex flex-col items-center justify-center gap-0.5">
    {/* Up Arrow */}
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path
        d="M2 4L5 1L8 4"
        stroke={active && dir === "asc" ? "#6860C8" : "#9CA3AF"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

    {/* Down Arrow */}
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path
        d="M2 2L5 5L8 2"
        stroke={active && dir === "desc" ? "#6860C8" : "#9CA3AF"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/* ================= CHECKBOX ================= */

const Checkbox = ({
  checked,
  onChange,
  indeterminate,
}: {
  checked: boolean;
  onChange: () => void;
  indeterminate?: boolean;
}) => (
  <span
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors
      ${
        checked || indeterminate
          ? "bg-[#6860C8] border-[#6860C8]"
          : "bg-white border-gray-300"
      }`}
  >
    {indeterminate && !checked ? (
      <span className="w-2.5 h-0.5 bg-white rounded-sm" />
    ) : checked ? (
      <svg width="11" height="9" viewBox="0 0 11 9">
        <path
          d="M1 4.5L4 7.5L10 1"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : null}
  </span>
);

/* ================= HEADER CELL ================= */

interface ThProps {
  label: string;
  sortable?: boolean;
  sk?: SortKey;
  activeSortKey: SortKey;
  activeSortDir: SortDir;
  onSort: (key: SortKey) => void;
}

const Th = ({
  label,
  sortable,
  sk,
  activeSortKey,
  activeSortDir,
  onSort,
}: ThProps) => (
  <th
    onClick={sortable && sk ? () => onSort(sk) : undefined}
    className={`px-6 py-3 text-left text-sm font-medium text-gray-500 whitespace-nowrap select-none ${
      sortable ? "cursor-pointer" : ""
    }`}
  >
    <span className="inline-flex items-center">
      {label}
      {sortable && sk && (
        <SortIcon active={activeSortKey === sk} dir={activeSortDir} />
      )}
    </span>
  </th>
);

/* ================= MAIN COMPONENT ================= */

export default function SelectedDevices() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(MOCK_DEVICES.map((d) => d.id))
  );

  const filtered = useMemo(
    () =>
      MOCK_DEVICES.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;

      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }

      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allSelected = sorted.every((d) => selected.has(d.id));
  const someSelected =
    sorted.some((d) => selected.has(d.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const sortProps = {
    activeSortKey: sortKey,
    activeSortDir: sortDir,
    onSort: handleSort,
  };

  return (
    <div className="mb-8">
      <div className="font-bold text-lg text-black mb-1">
        Selected Devices ({selected.size})
      </div>

      <div className="text-sm text-gray-400 mb-4">
        Select all or narrow the data down to a specific group of devices
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white w-60">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-800 bg-transparent w-full"
          />
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-6 py-3 w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
              />
            </th>
            <Th label="Name" sortable sk="name" {...sortProps} />
            <Th label="Meetings" sortable sk="meetings" {...sortProps} />
            <Th label="Total Users" sortable sk="totalUsers" {...sortProps} />
            <Th label="Hours in Use" sortable sk="hoursInUse" {...sortProps} />
            <Th label="Content Items" sortable sk="contentItems" {...sortProps} />
            <Th label="Avg. Duration" sortable sk="avgDurationMinutes" {...sortProps} />
            <Th label="Content Types" sortable sk="contentTypes" {...sortProps} />
          </tr>
        </thead>

        <tbody>
          {sorted.map((device, idx) => {
            const isChecked = selected.has(device.id);

            return (
              <tr
                key={device.id}
                onClick={() => toggleOne(device.id)}
                className={`cursor-pointer hover:bg-gray-50 ${
                  idx < sorted.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <td className="px-6 py-4 w-12">
                  <Checkbox
                    checked={isChecked}
                    onChange={() => toggleOne(device.id)}
                  />
                </td>

                <td
                  className={`px-6 py-4 text-sm ${
                    isChecked
                      ? "font-semibold text-black"
                      : "text-black"
                  }`}
                >
                  {device.name}
                </td>

                <td className="px-6 py-4 text-sm text-gray-700">
                  {fmt(device.meetings)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {fmt(device.totalUsers)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {device.hoursInUse === null ? "-" : device.hoursInUse}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {fmt(device.contentItems)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {device.avgDuration ?? "-"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {fmt(device.contentTypes)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}