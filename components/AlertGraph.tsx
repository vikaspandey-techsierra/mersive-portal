"use client";

import { MOCK_ALERT_HISTORY } from "@/lib/alertHistoryMock";
import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AlertHistoryPoint {
  date: string;
  unreachable: number;
  rebooted: number;
  unassignedFromTemplate: number;
  updateAvailable: number;
  updateCompleted: number;
}

// ── Data fetching ─────────────────────────────────────────────────────────────
//
// 🔁 SWAP POINT: When the backend API is ready, replace this function body:
//
//   async function fetchAlertHistory(range: string): Promise<AlertHistoryPoint[]> {
//     const res = await fetch(`/api/alert-history?range=${range}`);
//     if (!res.ok) throw new Error("Failed to fetch alert history");
//     const json = await res.json();
//     return json.data;
//   }
//
// Until then, the mock below is used.
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAlertHistory(range: string): Promise<AlertHistoryPoint[]> {
  // MOCK — delete this block and uncomment the API call above when ready
  await new Promise((r) => setTimeout(r, 300)); // simulate network delay
  return MOCK_ALERT_HISTORY[range] ?? [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Tooltip ───────────────────────────────────────────────────────────────────

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

// ── Series config ─────────────────────────────────────────────────────────────

interface SeriesItem {
  key: keyof Omit<AlertHistoryPoint, "date">;
  label: string;
  color: string;
}

const SERIES: SeriesItem[] = [
  { key: "unreachable", label: "Unreachable", color: "#6860C8" },
  { key: "rebooted", label: "Rebooted", color: "#D44E80" },
  {
    key: "unassignedFromTemplate",
    label: "Unassigned from template",
    color: "#4D9EC4",
  },
  { key: "updateAvailable", label: "Update available", color: "#7E9E2E" },
  { key: "updateCompleted", label: "Update completed", color: "#E8902A" },
];

// ── Time ranges ───────────────────────────────────────────────────────────────

const TIME_RANGES = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "60d", label: "Last 60 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "all", label: "All time" },
];

// ── Toggle checkbox ───────────────────────────────────────────────────────────

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
    className="inline-flex items-center gap-1.5 cursor-pointer select-none"
    onClick={onToggle}
  >
    <span
      className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
      style={
        checked
          ? { borderColor: item.color, background: item.color }
          : { borderColor: "#d1d5db", background: "#fff" }
      }
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
      className="rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-opacity"
      style={{
        background: item.color,
        color: "#fff",
        opacity: checked ? 1 : 0.4,
      }}
    >
      {item.label}
    </span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export default function AlerthistoryGraph() {
  const [selectedRange, setSelectedRange] = useState("7d");
  const [data, setData] = useState<AlertHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SERIES.map((s) => [s.key, true]))
  );

  // Fetch data whenever range changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAlertHistory(selectedRange).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRange]);

  const toggleKey = (key: string) =>
    setActiveKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  // x-axis tick interval — show fewer ticks for larger datasets
  const tickInterval = useMemo(() => {
    if (data.length <= 7) return 0;
    if (data.length <= 30) return 4;
    if (data.length <= 60) return 9;
    return 14;
  }, [data.length]);

  const chartData = useMemo(
    () =>
      data.map((d) => {
        const point: Record<string, string | number> = {
          label: fmtDate(d.date),
        };
        SERIES.forEach((s) => {
          point[s.key] = activeKeys[s.key] ? (d[s.key] as number) : 0;
        });
        return point;
      }),
    [data, activeKeys]
  );

  const legendItems = SERIES;

  return (
    <div className="mb-8">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="font-bold text-[18px] text-gray-900">
            Alert History
          </div>
          <div className="text-[13px] text-gray-500 mt-0.5">
            View the quantity and which types of alerts were emailed to users
          </div>
        </div>

        {/* Time-range pill buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {TIME_RANGES.map((r) => {
            const active = r.id === selectedRange;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRange(r.id)}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium border transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[#6860C8] text-white border-[#6860C8]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart card */}
      <div className="bg-white rounded-xl p-5 pb-4 border border-gray-200 relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center z-10">
            <div className="w-6 h-6 border-2 border-[#6860C8] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#374151" }}
              interval={tickInterval}
              axisLine={false}
              tickLine={false}
              padding={{ left: 8, right: 8 }}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#374151" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<ChartTooltip />} />

            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="linear"
                dataKey={s.key}
                name={s.label}
                stackId="1"
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.85}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        {/* Legend / toggles */}
        <div className="flex items-center mt-3.5 flex-wrap">
          {legendItems.map((item, index) => (
            <div key={item.key} className="flex items-center">
              <SeriesToggle
                item={item}
                checked={activeKeys[item.key]}
                onToggle={() => toggleKey(item.key)}
              />

              {index !== legendItems.length - 1 && (
                <div className="mx-3 h-4 w-px bg-[#E2E1E8]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
