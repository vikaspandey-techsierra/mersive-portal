"use client";


import { UserConnectionPoint } from "@/components/analytics/usage/page";
import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TEntry {
  name: string;
  value: number;
  color: string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TEntry[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const items = [...payload].reverse();
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4, color: "#333" }}>
        {label}
      </div>
      {items
        .filter((e) => e.value > 0)
        .map((e) => (
          <div key={e.name} style={{ color: e.color, marginTop: 2 }}>
            {e.name}: {e.value}
          </div>
        ))}
    </div>
  );
};

interface SeriesItem {
  key: keyof Omit<UserConnectionPoint, "date">;
  label: string;
  color: string;
}

interface FilterGroup {
  id: string;
  label: string;
  items: SeriesItem[];
}

// IMPORTANT: items are listed in BOTTOM-TO-TOP stack order.
// This order must never change at runtime.
const FILTER_GROUPS: FilterGroup[] = [
  {
    id: "mode",
    label: "Mode",
    items: [
      { key: "wired", label: "Wired", color: "#D44E80" },
      { key: "wireless", label: "Wireless", color: "#6860C8" },
    ],
  },
  {
    id: "protocol",
    label: "Protocol",
    items: [
      { key: "hdmiIn", label: "HDMI in", color: "#E8902A" },
      { key: "googleCast", label: "Google Cast", color: "#7E9E2E" },
      { key: "miracast", label: "Miracast", color: "#4D9EC4" },
      { key: "airplay", label: "AirPlay", color: "#D44E80" },
      { key: "web", label: "Web", color: "#6860C8" },
    ],
  },
  {
    id: "os",
    label: "OS",
    items: [
      { key: "otherOs", label: "Other", color: "#E8902A" },
      { key: "android", label: "Android", color: "#7E9E2E" },
      { key: "ios", label: "iOS", color: "#4D9EC4" },
      { key: "windows", label: "Windows", color: "#D44E80" },
      { key: "macos", label: "MacOS", color: "#6860C8" },
    ],
  },
  {
    id: "conference",
    label: "Conference",
    items: [
      { key: "presentationOnly", label: "Presentation only", color: "#4D9EC4" },
      { key: "zoom", label: "Zoom", color: "#D44E80" },
      { key: "teams", label: "Teams", color: "#6860C8" },
    ],
  },
];

const SeriesToggle = ({
  item,
  checked,
  onToggle,
}: {
  item: SeriesItem;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
      outline: "none",
    }}
    onClick={onToggle}
  >
    {/* Standalone checkbox — left of the chip */}
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: checked ? `2px solid ${item.color}` : "2px solid #ccc",
        background: checked ? item.color : "#fff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.15s",
      }}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4L3.5 6.5L9 1"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>

    <span
      style={{
        background: item.color,
        color: "#fff",
        borderRadius: 5,
        padding: "4px 10px",
        fontSize: 12,
        fontWeight: 500,
        opacity: checked ? 1 : 0.45,
        transition: "opacity 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {item.label}
    </span>
  </div>
);

interface UserConnectionsProps {
  data: UserConnectionPoint[];
  interval: number;
}

export default function UserConnections({
  data,
  interval,
}: UserConnectionsProps) {
  const [selectedGroupId, setSelectedGroupId] = useState("protocol");

  const [activeKeys, setActiveKeys] = useState<
    Record<string, Record<string, boolean>>
  >(() =>
    Object.fromEntries(
      FILTER_GROUPS.map((g) => [
        g.id,
        Object.fromEntries(g.items.map((i) => [i.key, true])),
      ])
    )
  );

  const toggleKey = (groupId: string, key: string) =>
    setActiveKeys((prev) => ({
      ...prev,
      [groupId]: { ...prev[groupId], [key]: !prev[groupId][key] },
    }));

  const currentGroup = FILTER_GROUPS.find((g) => g.id === selectedGroupId)!;
  const currentActive = activeKeys[selectedGroupId];

  // KEY FIX: Zero-out hidden series instead of unmounting <Area> components
  const connectionData = useMemo(() => {
    return data.map((d) => {
      const point: Record<string, string | number> = { label: fmtDate(d.date) };
      currentGroup.items.forEach((item) => {
        point[item.key] = currentActive[item.key] ? (d[item.key] as number) : 0;
      });
      return point;
    });
  }, [data, currentGroup, currentActive]);

  // Legend: left→right = top→bottom in stack (reverse of items[] which is bottom→top)
  const legendItems = [...currentGroup.items].reverse();

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: 15,
          marginBottom: 2,
          color: "#000",
        }}
      >
        User Connections
      </div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
        Compare connection modes, sharing protocols, user operating systems, and
        types of conferencing solutions used
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "20px 16px 16px",
          border: "1px solid #ebebeb",
        }}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={connectionData}
            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray=""
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#aaa" }}
              interval={interval}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#aaa" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />

            {currentGroup.items.map((item) => (
              <Area
                key={item.key}
                type="linear"
                dataKey={item.key}
                name={item.label}
                stackId="1"
                stroke={item.color}
                fill={item.color}
                fillOpacity={0.85}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 14,
            flexWrap: "wrap",
          }}
        >
          {/* Group dropdown — no checkbox */}
          <div
            style={{
              border: "1px solid #d0d0d0",
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              background: "#fff",
            }}
          >
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                border: "none",
                padding: "6px 22px 6px 10px",
                fontSize: 13,
                fontFamily: "inherit",
                color: "#333",
                background: "transparent",
                cursor: "pointer",
                outline: "none",
                fontWeight: 500,
              }}
            >
              {FILTER_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <span
              style={{
                marginLeft: -20,
                marginRight: 6,
                pointerEvents: "none",
                fontSize: 10,
                color: "#666",
              }}
            >
              ▾
            </span>
          </div>

          {/* Series toggles: standalone checkbox to the left of each colored chip */}
          {legendItems.map((item) => (
            <SeriesToggle
              key={item.key}
              item={item}
              checked={currentActive[item.key]}
              onToggle={() => toggleKey(selectedGroupId, item.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
