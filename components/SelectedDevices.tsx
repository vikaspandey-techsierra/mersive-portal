"use client";

import { useState, useMemo } from "react";

// TYPES
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

// MOCK DATA
const MOCK_DEVICES: Device[] = [
  {
    id: "1", name: "Board Room",
    meetings: 2, totalUsers: 3, hoursInUse: 2,
    contentItems: 1, avgDuration: "1 hr", avgDurationMinutes: 60, contentTypes: 2,
  },
  {
    id: "2", name: "Corner Conference",
    meetings: 1, totalUsers: 2, hoursInUse: 0.5,
    contentItems: 2, avgDuration: "30 min", avgDurationMinutes: 30, contentTypes: 1,
  },
  {
    id: "3", name: "Hallway",
    meetings: 1, totalUsers: 1, hoursInUse: 0.75,
    contentItems: 1, avgDuration: "45 min", avgDurationMinutes: 45, contentTypes: 1,
  },
  {
    id: "4", name: "John's Office",
    meetings: 2, totalUsers: 1, hoursInUse: 4,
    contentItems: 4, avgDuration: "2 hrs", avgDurationMinutes: 120, contentTypes: 3,
  },
  {
    id: "5", name: "Temp Office",
    meetings: null, totalUsers: null, hoursInUse: null,
    contentItems: null, avgDuration: null, avgDurationMinutes: null, contentTypes: null,
  },
];

// HELPERS
const fmt = (v: number | null) => (v === null ? "-" : String(v));

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      marginLeft: 5,
      verticalAlign: "middle",
      lineHeight: 1,
    }}
  >
    <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
      <path
        d="M1 4L4 1L7 4"
        stroke={active && dir === "asc" ? "#6860C8" : "#c0c0c0"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
      <path
        d="M1 1L4 4L7 1"
        stroke={active && dir === "desc" ? "#6860C8" : "#c0c0c0"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

// CHECKBOX 
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
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    style={{
      width: 20,
      height: 20,
      borderRadius: 5,
      border: `2px solid ${checked || indeterminate ? "#6860C8" : "#ccc"}`,
      background: checked || indeterminate ? "#6860C8" : "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
      transition: "all 0.15s",
    }}
  >
    {indeterminate && !checked ? (
      <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
        <rect x="0" y="0" width="10" height="2" rx="1" fill="#fff" />
      </svg>
    ) : checked ? (
      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
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

// TABLE HEADER CELL 
const Th = ({
  label,
  sortable,
  sk,
  activeSortKey,
  activeSortDir,
  onSort,
}: {
  label: string;
  sortable?: boolean;
  sk?: SortKey;
  activeSortKey?: SortKey;
  activeSortDir?: SortDir;
  onSort?: (key: SortKey) => void;
}) => (
  <th
    onClick={sortable && sk && onSort ? () => onSort(sk) : undefined}
    style={{
      padding: "10px 16px",
      textAlign: "left",
      fontSize: 13,
      fontWeight: 500,
      color: "#555",
      cursor: sortable ? "pointer" : "default",
      whiteSpace: "nowrap",
      userSelect: "none",
      borderBottom: "1px solid #ebebeb",
      background: "#fff",
    }}
  >
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <span>{label}</span>
      {sortable && sk && activeSortKey !== undefined && activeSortDir !== undefined && (
        <SortIcon active={activeSortKey === sk} dir={activeSortDir} />
      )}
    </span>
  </th>
);

// MAIN COMPONENT
export default function SelectedDevices() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(MOCK_DEVICES.map((d) => d.id))
  );

  const filtered = useMemo(() =>
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
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
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
  const someSelected = sorted.some((d) => selected.has(d.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        sorted.forEach((d) => next.delete(d.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        sorted.forEach((d) => next.add(d.id));
        return next;
      });
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

  // shared props to avoid repeating activeSortKey/activeSortDir/onSort
  const sortProps = { activeSortKey: sortKey, activeSortDir: sortDir, onSort: handleSort };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: "#000", marginBottom: 4 }}>
        Selected Devices ({MOCK_DEVICES.length})
      </div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
        Select all or narrow the data down to a specific group of devices
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "8px 12px",
          background: "#fff",
          width: 220,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#aaa" strokeWidth="1.4" />
            <path d="M10 10L13 13" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#333",
              background: "transparent",
              width: "100%",
              fontFamily: "inherit",
            }}
          />
        </div>
      </div>

      <div style={{
        border: "1px solid #ebebeb",
        borderRadius: 10,
        overflow: "hidden",
        background: "#fff",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ padding: "10px 16px", borderBottom: "1px solid #ebebeb", width: 48 }}>
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              </th>
              <Th label="Name"          sortable sk="name"               {...sortProps} />
              <Th label="Meetings"      sortable sk="meetings"           {...sortProps} />
              <Th label="Total Users"   sortable sk="totalUsers"         {...sortProps} />
              <Th label="Hours in Use"  sortable sk="hoursInUse"         {...sortProps} />
              <Th label="Content Items" sortable sk="contentItems"       {...sortProps} />
              <Th label="Avg. Duration" sortable sk="avgDurationMinutes" {...sortProps} />
              <Th label="Content Types" sortable sk="contentTypes"       {...sortProps} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((device, idx) => {
              const isChecked = selected.has(device.id);
              return (
                <tr
                  key={device.id}
                  onClick={() => toggleOne(device.id)}
                  style={{
                    cursor: "pointer",
                    background: "#fff",
                    borderBottom: idx < sorted.length - 1 ? "1px solid #f5f5f5" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
                >
                  <td style={{ padding: "14px 16px", width: 48 }}>
                    <Checkbox checked={isChecked} onChange={() => toggleOne(device.id)} />
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: isChecked ? 600 : 400, color: "#000" }}>
                    {device.name}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#333" }}>{fmt(device.meetings)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#333" }}>{fmt(device.totalUsers)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#333" }}>{device.hoursInUse === null ? "-" : device.hoursInUse}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#333" }}>{fmt(device.contentItems)}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#333" }}>{device.avgDuration ?? "-"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, color: "#333" }}>{fmt(device.contentTypes)}</td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "#aaa" }}>
                  No devices match your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}