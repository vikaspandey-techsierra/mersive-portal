"use client";

import { DeviceUtilizationPoint } from "@/app/pages/analytics/usage/page";
import { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TEntry { name: string; value: number; color: string }

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: TEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8,
      padding: "8px 12px", fontSize: 13, boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4, color: "#333" }}>{label}</div>
      {payload.filter(e => e.value > 0).map(e => (
        <div key={e.name} style={{ color: e.color, marginTop: 2 }}>{e.name}: {e.value}</div>
      ))}
    </div>
  );
};

type DeviceMetric = "meetings" | "users" | "hours" | "connections" | "posts" | "avgLength";

const METRIC_LABELS: Record<DeviceMetric, string> = {
  meetings: "Number of meetings",
  users: "Number of users",
  hours: "Hours in use",
  connections: "Number of connections",
  posts: "Number of posts",
  avgLength: "Avg. length of meetings",
};

const METRIC_KEYS = Object.keys(METRIC_LABELS) as DeviceMetric[];

// CUSTOM DROPDOWN
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

  // Close on outside click
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
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: color,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "6px 10px 6px 14px",
          fontSize: 13,
          fontWeight: 500,
          fontFamily: "inherit",
          cursor: "pointer",
          outline: "none",
          whiteSpace: "nowrap",
        }}
      >
        {displayLabel}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.85, flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          minWidth: 220,
          zIndex: 999,
          padding: "6px 0",
        }}>
          {showNone && (
            <div
              onClick={() => { onChange(null); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 16px",
                fontSize: 14,
                cursor: "pointer",
          outline: "none",
                color: value === null ? "#000" : "#333",
                fontWeight: value === null ? 500 : 400,
                background: "transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f7")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span>None</span>
              {value === null && (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <path d="M1 5.5L5 9.5L13 1" stroke="#6860C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
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
                  if (!isDisabled) { onChange(key); setOpen(false); }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  fontSize: 14,
                  cursor: isDisabled ? "default" : "pointer",
                  color: isDisabled ? "#bbb" : "#333",
                  fontWeight: isSelected ? 500 : 400,
                  background: "transparent",
                  transition: "background 0.1s",
                  userSelect: "none",
                }}
                onMouseEnter={e => {
                  if (!isDisabled) e.currentTarget.style.background = "#f5f5f7";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span>{METRIC_LABELS[key]}</span>
                {isSelected && (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                    <path d="M1 5.5L5 9.5L13 1" stroke="#6860C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// PROPS
interface DeviceUtilizationProps {
  data: DeviceUtilizationPoint[];
  interval: number;
}

export default function DeviceUtilization({ data, interval }: DeviceUtilizationProps) {
  const [metricA, setMetricA] = useState<DeviceMetric>("meetings");
  const [metricB, setMetricB] = useState<DeviceMetric | null>("connections");

  const handleChangeA = (next: DeviceMetric | null) => {
    if (next === null) return; // A is always required
    if (next === metricB) setMetricB(metricA); // swap B to old A
    setMetricA(next);
  };

  const handleChangeB = (next: DeviceMetric | null) => {
    if (next === metricA) setMetricA(metricB!); // swap A to old B
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

  const tickFmt = (v: number) => `${v} hr`;

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: "#000" }}>
        Device Utilization
      </div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
        Compare up to two types of usage data for devices in your organization
      </div>

      <div style={{
        background: "#fff", borderRadius: 10,
        padding: "20px 16px 16px", border: "1px solid #ebebeb",
      }}>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={deviceData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#aaa" }} interval={interval} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#aaa" }} tickFormatter={tickFmt} axisLine={false} tickLine={false} />
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

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
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