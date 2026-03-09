"use client";

import { useState, useRef, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Check } from "lucide-react";
import { DeviceUtilizationPoint } from "@/lib/analytics";

// ─── Date formatter ───────────────────────────────────────────────────────────

function fmtDate(dateStr: string): string {
  // append T00:00:00 to force local-timezone parse (avoids off-by-one day)
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Canonical metric keys ────────────────────────────────────────────────────
//
// These map 1-to-1 to fields on DeviceUtilizationPoint, which in turn
// use the canonical names from the Metrics Methodology sheet.
// ts_meetings_duration_avg is FE-derived (no extra API call).

type DeviceMetric =
  | "ts_meetings_num" // # of meetings
  | "ts_connections_num" // # of connections
  | "ts_users_num" // # of users
  | "ts_meetings_duration_tot" // hours in use (sum)
  | "ts_posts_num" // # of posts
  | "ts_meetings_duration_avg"; // avg. length of meetings (FE-derived)

const METRIC_LABELS: Record<DeviceMetric, string> = {
  ts_meetings_num: "Number of meetings",
  ts_users_num: "Number of users",
  ts_meetings_duration_tot: "Hours in use",
  ts_connections_num: "Number of connections",
  ts_posts_num: "Number of posts",
  ts_meetings_duration_avg: "Avg. length of meetings",
};

const METRIC_KEYS = Object.keys(METRIC_LABELS) as DeviceMetric[];

// Metrics that represent a time value → format as "Xhr" on axis + tooltip
const TIME_METRICS = new Set<DeviceMetric>([
  "ts_meetings_duration_tot",
  "ts_meetings_duration_avg",
]);

const PURPLE = "#6860C8";
const PINK = "#D44E80";

// ─── Tooltip ──────────────────────────────────────────────────────────────────

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
      <div className="font-semibold mb-1 text-black">{label}</div>
      {payload
        .filter((e) => e.value != null && e.value > 0)
        .map((e) => (
          <div key={e.name} className="mt-1" style={{ color: e.color }}>
            {e.name}:{" "}
            {e.name === METRIC_LABELS["ts_meetings_duration_avg"] ||
            e.name === METRIC_LABELS["ts_meetings_duration_tot"]
              ? `${e.value.toFixed(2)} hr`
              : e.value}
          </div>
        ))}
    </div>
  );
}

// ─── Rotated Y-axis labels ────────────────────────────────────────────────────

function LeftAxisLabel({
  viewBox,
  label,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
  label: string;
}) {
  if (!viewBox) return null;
  const cx = viewBox.x - 2;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={PURPLE}
      fontSize={11}
      fontWeight={500}
      textAnchor="middle"
      transform={`rotate(-90, ${cx}, ${cy})`}
    >
      {label}
    </text>
  );
}

function RightAxisLabel({
  viewBox,
  label,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
  label: string;
}) {
  if (!viewBox) return null;
  const cx = viewBox.x + viewBox.width + 10;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={PINK}
      fontSize={11}
      fontWeight={500}
      textAnchor="middle"
      transform={`rotate(90, ${cx}, ${cy})`}
    >
      {label}
    </text>
  );
}

// ─── Metric dropdown ──────────────────────────────────────────────────────────

function MetricDropdown({
  value,
  color,
  disabledOption,
  showNone,
  onChange,
}: {
  value: DeviceMetric | null;
  color: string;
  disabledOption: DeviceMetric | null;
  showNone?: boolean;
  onChange: (v: DeviceMetric | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-white text-[13px] font-medium rounded-md px-4 py-1.5 whitespace-nowrap"
        style={{ background: color }}
      >
        {value ? METRIC_LABELS[value] : "None"}
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M2 4l4 4 4-4"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg min-w-[55 z-999 py-1.5">
          {showNone && (
            <div
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition ${
                value === null
                  ? "text-black font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>None</span>
              {value === null && (
                <Check size={16} strokeWidth={2.5} className="text-[#6860C8]" />
              )}
            </div>
          )}

          {METRIC_KEYS.map((key) => {
            const isSelected = value === key;
            const isDisabled = key === disabledOption;

            return (
              <div
                key={key}
                onClick={() => {
                  if (!isDisabled) {
                    onChange(key);
                    setOpen(false);
                  }
                }}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition ${
                  isDisabled
                    ? "text-gray-300 cursor-default"
                    : "cursor-pointer hover:bg-gray-50 text-gray-800"
                } ${isSelected ? "font-medium" : ""}`}
              >
                <span>{METRIC_LABELS[key]}</span>
                {isSelected && (
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className="text-[#6860C8]"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface DeviceUtilizationProps {
  data: DeviceUtilizationPoint[];
  interval: number;
}

export default function DeviceUtilization({
  data,
  interval,
}: DeviceUtilizationProps) {
  const [metricA, setMetricA] = useState<DeviceMetric>("ts_meetings_num");
  const [metricB, setMetricB] = useState<DeviceMetric | null>(
    "ts_connections_num",
  );

  // Swap logic: if user picks B's current value for A (and vice-versa), swap
  const handleChangeA = (next: DeviceMetric | null) => {
    if (!next) return;
    if (next === metricB) setMetricB(metricA);
    setMetricA(next);
  };

  const handleChangeB = (next: DeviceMetric | null) => {
    if (next !== null && next === metricA) setMetricA(metricB!);
    setMetricB(next);
  };

  const hasTwoMetrics = metricB !== null;
  const leftIsTime = TIME_METRICS.has(metricA);
  const rightIsTime = metricB !== null && TIME_METRICS.has(metricB);

  // Map DeviceUtilizationPoint (canonical keys) directly — no aliasing needed
  const chartData = data.map((d) => ({
    label: fmtDate(d.date),
    ts_meetings_num: d.ts_meetings_num ?? 0,
    ts_connections_num: d.ts_connections_num ?? 0,
    ts_users_num: d.ts_users_num ?? 0,
    ts_posts_num: d.ts_posts_num ?? 0,
    ts_meetings_duration_tot: d.ts_meetings_duration_tot ?? 0,
    ts_meetings_duration_avg: d.ts_meetings_duration_avg ?? 0,
  }));

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">
        Device Utilization
      </div>
      <div className="text-[13px] text-gray-400 mb-3">
        Compare up to two types of usage data for devices in your organization
      </div>

      <div className="bg-white rounded-xl py-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{
              top: 8,
              right: hasTwoMetrics ? 48 : 16,
              left: 24,
              bottom: 0,
            }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              interval={interval}
              axisLine={false}
              tickLine={false}
            />

            {/* Left Y-axis — always visible */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={34}
              tickFormatter={
                leftIsTime
                  ? (v: number) => `${v % 1 === 0 ? v : v.toFixed(1)}hr`
                  : undefined
              }
              label={<LeftAxisLabel label={METRIC_LABELS[metricA]} />}
            />

            {/* Right Y-axis — only when a second metric is selected */}
            {hasTwoMetrics && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={34}
                tickFormatter={
                  rightIsTime
                    ? (v: number) => `${v % 1 === 0 ? v : v.toFixed(1)}hr`
                    : undefined
                }
                label={<RightAxisLabel label={METRIC_LABELS[metricB!]} />}
              />
            )}

            <Tooltip content={<ChartTooltip />} />

            {/* Line A — purple */}
            <Line
              yAxisId="left"
              type="linear"
              dataKey={metricA}
              name={METRIC_LABELS[metricA]}
              stroke={PURPLE}
              strokeWidth={2}
              dot={{ r: 4, fill: PURPLE, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />

            {/* Line B — pink (conditional) */}
            {hasTwoMetrics && (
              <Line
                yAxisId="right"
                type="linear"
                dataKey={metricB!}
                name={METRIC_LABELS[metricB!]}
                stroke={PINK}
                strokeWidth={2}
                dot={{ r: 4, fill: PINK, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        {/* Metric dropdowns */}
        <div className="flex gap-2.5 mt-3.5 flex-wrap items-center px-6">
          <MetricDropdown
            value={metricA}
            color={PURPLE}
            disabledOption={metricB}
            showNone={false}
            onChange={handleChangeA}
          />
          <MetricDropdown
            value={metricB}
            color={PINK}
            disabledOption={metricA}
            showNone={true}
            onChange={handleChangeB}
          />
        </div>
      </div>
    </div>
  );
}
