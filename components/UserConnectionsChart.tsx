"use client";

import { UserConnectionPoint } from "@/lib/types/homepage";
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
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
      <div className="font-semibold mb-1 text-gray-800">{label}</div>
      {items
        .filter((e) => e.value > 0)
        .map((e) => (
          <div key={e.name} className="mt-1" style={{ color: e.color }}>
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
    className="inline-flex items-center gap-1.5 cursor-pointer"
    onClick={onToggle}
  >
    <span
      className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all ${
        checked ? "" : "border-gray-300 bg-white"
      }`}
      style={
        checked
          ? {
              borderColor: item.color,
              background: item.color,
            }
          : undefined
      }
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8">
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
      className="rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-opacity"
      style={{
        background: item.color,
        color: "#fff",
        opacity: checked ? 1 : 0.45,
      }}
    >
      {item.label}
    </span>
  </div>
);

interface UserConnectionsProps {
  data: UserConnectionPoint[];
  interval: number;
  title: string;
  subtitle?: string;
}

export default function UserConnections({
  data,
  interval,
  title,
  subtitle,
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

  const connectionData = useMemo(() => {
    return data.map((d) => {
      const point: Record<string, string | number> = { label: fmtDate(d.date) };
      currentGroup.items.forEach((item) => {
        point[item.key] = currentActive[item.key] ? (d[item.key] as number) : 0;
      });
      return point;
    });
  }, [data, currentGroup, currentActive]);

  const legendItems = [...currentGroup.items].reverse();

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">
        {title}
      </div>

      <div className="text-[13px] text-gray-400 mb-3">
        {subtitle}
      </div>

      <div className="bg-white rounded-xl p-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={connectionData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              interval={interval}
              axisLine={false}
              tickLine={false}
              padding={{ left: 8, right: 8 }}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#000" }}
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

        <div className="flex items-center gap-3 mt-3.5 flex-wrap">
          <div className="border border-gray-300 rounded-md inline-flex items-center bg-white">
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="appearance-none border-none px-2.5 py-1.5 text-[13px] text-gray-800 bg-transparent cursor-pointer outline-none font-medium"
            >
              {FILTER_GROUPS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>

            <span className="-ml-5 mr-1.5 text-[10px] text-gray-500 pointer-events-none">
              ▾
            </span>
          </div>

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
