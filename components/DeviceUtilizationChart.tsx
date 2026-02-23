"use client";

import { DeviceUtilizationPoint } from "@/components/analytics/usage/page";
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
      <div className="font-semibold mb-1 text-black">{label}</div>
      {payload
        .filter((e) => e.value > 0)
        .map((e) => (
          <div key={e.name} className="mt-1" style={{ color: e.color }}>
            {e.name}: {e.value}
          </div>
        ))}
    </div>
  );
};

type DeviceMetric =
  | "meetings"
  | "users"
  | "hours"
  | "connections"
  | "posts"
  | "avgLength";

const METRIC_LABELS: Record<DeviceMetric, string> = {
  meetings: "Number of meetings",
  users: "Number of users",
  hours: "Hours in use",
  connections: "Number of connections",
  posts: "Number of posts",
  avgLength: "Avg. length of meetings",
};

const METRIC_KEYS = Object.keys(METRIC_LABELS) as DeviceMetric[];

const MetricDropdown = ({
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
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = value ? METRIC_LABELS[value] : "None";

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-white text-[13px] font-medium rounded-md px-4 py-1.5 whitespace-nowrap"
        style={{ background: color }}
      >
        {displayLabel}
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

      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg min-w-55 z-999 py-1.5">
          {showNone && (
            <div
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition ${
                value === null
                  ? "text-black font-medium"
                  : "text-gray-700 hover:bg-gray-100"
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
                    ? "text-gray-400 cursor-default"
                    : "cursor-pointer hover:bg-gray-100 text-gray-800"
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
};

interface DeviceUtilizationProps {
  data: DeviceUtilizationPoint[];
  interval: number;
}

export default function DeviceUtilization({
  data,
  interval,
}: DeviceUtilizationProps) {
  const [metricA, setMetricA] = useState<DeviceMetric>("meetings");
  const [metricB, setMetricB] = useState<DeviceMetric | null>("connections");

  const handleChangeA = (next: DeviceMetric | null) => {
    if (next === null) return;
    if (next === metricB) setMetricB(metricA);
    setMetricA(next);
  };

  const handleChangeB = (next: DeviceMetric | null) => {
    if (next === metricA) setMetricA(metricB!);
    setMetricB(next);
  };

  const deviceData = data.map((d) => ({
    label: fmtDate(d.date),
    meetings: d.meetings,
    users: Math.round(d.meetings * 1.4),
    hours: Math.round(d.meetings * 2.3),
    connections: d.connections,
    posts: Math.round(d.meetings * 0.8),
    avgLength: Math.round(d.meetings * 5),
  }));

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">
        Device Utilization
      </div>

      <div className="text-[13px] text-gray-400 mb-3">
        Compare up to two types of usage data for devices in your organization
      </div>

      <div className="bg-white rounded-xl p-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={deviceData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              interval={interval}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#000" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<ChartTooltip />} />

            <Line
              type="linear"
              dataKey={metricA}
              name={METRIC_LABELS[metricA]}
              stroke="#6860C8"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6860C8", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />

            {metricB && (
              <Line
                type="linear"
                dataKey={metricB}
                name={METRIC_LABELS[metricB]}
                stroke="#D44E80"
                strokeWidth={2}
                dot={{ r: 4, fill: "#D44E80", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div className="flex gap-2.5 mt-3.5 flex-wrap items-center">
          <MetricDropdown
            value={metricA}
            color="#6860C8"
            disabledOption={metricB}
            showNone={false}
            onChange={handleChangeA}
          />
          <MetricDropdown
            value={metricB}
            color="#D44E80"
            disabledOption={metricA}
            showNone={true}
            onChange={handleChangeB}
          />
        </div>
      </div>
    </div>
  );
}
