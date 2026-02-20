"use client";

import AnalyticsGraphPage from "@/components/analyticsPage";
import Card from "@/components/Card";
import DeviceStatusPie from "@/components/DeviceStatusPie";
import DeviceTypeDonut from "@/components/DeviceTypeDonut";
import FleetHealthGauge from "@/components/FleetHealthGauge";
import PlanTypePie from "@/components/PlanTypePie";
// ═══════════════════════════════════════════════════════════════════════════
//  STACKING-ORDER BUG FIX
//  Root cause: conditionally mounting/unmounting <Area> tags resets
//  Recharts' internal stack registration order. The re-mounted Area always
//  lands on top regardless of its intended position.
//
//  Fix: ALL <Area> components stay permanently mounted. Hidden series are
//  zeroed-out in the chart data via useMemo so the DOM order never changes.
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// BACKEND API CONTRACT  ← share with backend developer
// ─────────────────────────────────────────────────────────────────────────────

/** One day of Device Utilization data */
export interface DeviceUtilizationPoint {
  date: string; // ISO-8601 "2024-12-16"
  meetings: number; // total meetings that day
  connections: number; // total connections that day
}

/**
 * One day of User Connections data.
 * All 14 fields must always be present (0 if none that day).
 *
 * Grouping reference:
 *   Mode       → wireless, wired
 *   Protocol   → web, airplay, miracast, googleCast, hdmiIn
 *   OS         → macos, windows, ios, android, otherOs
 *   Conference → teams, zoom, presentationOnly
 */
export interface UserConnectionPoint {
  date: string;
  wireless: number;
  wired: number;
  web: number;
  airplay: number;
  miracast: number;
  googleCast: number;
  hdmiIn: number;
  macos: number;
  windows: number;
  ios: number;
  android: number;
  otherOs: number;
  teams: number;
  zoom: number;
  presentationOnly: number;
}

/**
 * Full API response shape
 *
 * GET /api/analytics/usage?range=7d
 *   range: "7d" | "30d" | "60d" | "90d" | "all"
 *
 * Sample response:
 * {
 *   "range": "7d",
 *   "deviceUtilization": [
 *     { "date": "2024-12-16", "meetings": 10, "connections": 11 },
 *     ...
 *   ],
 *   "userConnections": [
 *     {
 *       "date": "2024-12-16",
 *       "wireless": 8, "wired": 3,
 *       "web": 4, "airplay": 3, "miracast": 2, "googleCast": 1, "hdmiIn": 1,
 *       "macos": 3, "windows": 3, "ios": 2, "android": 2, "otherOs": 1,
 *       "teams": 4, "zoom": 4, "presentationOnly": 3
 *     },
 *     ...
 *   ]
 * }
 */
export interface AnalyticsApiResponse {
  range: "7d" | "30d" | "60d" | "90d" | "all";
  deviceUtilization: DeviceUtilizationPoint[];
  userConnections: UserConnectionPoint[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA GENERATOR  (replace with real API call)
// ─────────────────────────────────────────────────────────────────────────────
function generateMockData(days: number): AnalyticsApiResponse {
  const deviceUtilization: DeviceUtilizationPoint[] = [];
  const userConnections: UserConnectionPoint[] = [];
  const baseDate = new Date("2024-12-16");
  const wave = [10, 13, 3, 11, 20, 4, 2];
  const r = (base: number, spread = 0.1) =>
    Math.max(0, Math.round(base + (Math.random() - 0.5) * base * spread));

  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().split("T")[0];
    const p = wave[i % 7];
    deviceUtilization.push({
      date,
      meetings: r(p * 0.9),
      connections: r(p * 1.1),
    });
    userConnections.push({
      date,
      wireless: r(p * 0.7),
      wired: r(p * 0.3),
      web: r(p * 0.35),
      airplay: r(p * 0.28),
      miracast: r(p * 0.15),
      googleCast: r(p * 0.12),
      hdmiIn: r(p * 0.1),
      macos: r(p * 0.3),
      windows: r(p * 0.25),
      ios: r(p * 0.2),
      android: r(p * 0.15),
      otherOs: r(p * 0.1),
      teams: r(p * 0.4),
      zoom: r(p * 0.35),
      presentationOnly: r(p * 0.25),
    });
  }
  const rangeKey = { 7: "7d", 30: "30d", 60: "60d", 90: "90d" } as Record<
    number,
    string
  >;
  return {
    range: (rangeKey[days] ?? "all") as AnalyticsApiResponse["range"],
    deviceUtilization,
    userConnections,
  };
}

const MOCK: Record<string, AnalyticsApiResponse> = {
  "7d": generateMockData(7),
  "30d": generateMockData(30),
  "60d": generateMockData(60),
  "90d": generateMockData(90),
  all: generateMockData(120),
};

// Replace with real fetch:
// async function loadData(range: string): Promise<AnalyticsApiResponse> {
//   const res = await fetch(`/api/analytics/usage?range=${range}`);
//   return res.json();
// }

// ─────────────────────────────────────────────────────────────────────────────
// FILTER GROUP CONFIG
// ─────────────────────────────────────────────────────────────────────────────
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
// This order must never change at runtime (that would re-trigger the bug).
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

// Legend display order = reverse of stack order (top series shown first in legend)
// But we show legend in the order: left to right as they appear in the checkbox bar

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function tickInterval(days: number): number {
  if (days <= 7) return 0;
  if (days <= 30) return 4;
  if (days <= 60) return 8;
  return 13;
}
const DAY_COUNTS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 120,
};

// ─────────────────────────────────────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────────────────────────────────────
interface TEntry {
  name: string;
  value: number;
  color: string;
}
const ChartTooltip = ({
  active,
  payload,
  label,
  flipOrder = false,
}: {
  active?: boolean;
  payload?: TEntry[];
  label?: string;
  flipOrder?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  const items = flipOrder ? [...payload].reverse() : payload;
  return (
    <div
      style={{
        background: "#1a1a2e",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        minWidth: 160,
      }}
    >
      <p style={{ color: "#aaa", margin: "0 0 7px", fontWeight: 600 }}>
        {label}
      </p>
      {items
        .filter((e) => e.value > 0)
        .map((e) => (
          <div
            key={e.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: e.color,
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span style={{ color: "#ccc" }}>{e.name}:</span>
            <span
              style={{
                color: "#fff",
                fontWeight: 600,
                marginLeft: "auto",
                paddingLeft: 8,
              }}
            >
              {e.value}
            </span>
          </div>
        ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECKBOX PILL
// ─────────────────────────────────────────────────────────────────────────────
const CheckPill = ({
  item,
  checked,
  onToggle,
}: {
  item: SeriesItem;
  checked: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      opacity: checked ? 1 : 0.35,
      transition: "opacity 0.2s",
    }}
  >
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        border: `2px solid ${checked ? "#6860C8" : "#ccc"}`,
        backgroundColor: checked ? "#6860C8" : "#fff",
        display: "flex",
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
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
    <span
      style={{
        backgroundColor: item.color,
        color: "#fff",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 11px",
        borderRadius: 999,
        userSelect: "none",
      }}
    >
      {item.label}
    </span>
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";
type Tab = "Usage" | "Monitoring" | "Email Alerts";

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "60d", label: "Last 60 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Usage");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [selectedGroupId, setSelectedGroupId] = useState("protocol");

  // activeKeys[groupId][seriesKey] = boolean
  const [activeKeys, setActiveKeys] = useState<
    Record<string, Record<string, boolean>>
  >(() =>
    Object.fromEntries(
      FILTER_GROUPS.map((g) => [
        g.id,
        Object.fromEntries(g.items.map((i) => [i.key, true])),
      ]),
    ),
  );

  const toggleKey = (groupId: string, key: string) =>
    setActiveKeys((prev) => ({
      ...prev,
      [groupId]: { ...prev[groupId], [key]: !prev[groupId][key] },
    }));

  const apiData = MOCK[timeRange];
  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);

  // ── User connections chart data ──
  // KEY FIX: instead of conditionally rendering <Area> components (which
  // breaks stack order), we always render ALL areas and zero-out values
  // for hidden series right here in the data transform.
  const currentGroup = FILTER_GROUPS.find((g) => g.id === selectedGroupId)!;
  const currentActive = activeKeys[selectedGroupId];

  const connectionData = useMemo(() => {
    return apiData.userConnections.map((d) => {
      const point: Record<string, string | number> = { label: fmtDate(d.date) };
      currentGroup.items.forEach((item) => {
        // If the series is active: use real value. If hidden: use 0.
        point[item.key] = currentActive[item.key] ? (d[item.key] as number) : 0;
      });
      return point;
    });
  }, [apiData, currentGroup, currentActive]);

  // Legend displayed left→right (reverse of bottom→top stack order)
  const legendItems = [...currentGroup.items].reverse();

  type DeviceMetric =
    | "meetings"
    | "users"
    | "hours"
    | "connections"
    | "posts"
    | "avgLength";

  const [metricA, setMetricA] = useState<DeviceMetric>("meetings");
  const [metricB, setMetricB] = useState<DeviceMetric | "none">("connections");

  const deviceData = apiData.deviceUtilization.map((d) => ({
    label: fmtDate(d.date),
    meetings: d.meetings,
    users: Math.round(d.meetings * 1.4),
    hours: Math.round(d.meetings * 2.3),
    connections: d.connections,
    posts: Math.round(d.meetings * 0.8),
    avgLength: Math.round(d.meetings * 5),
  }));

  const METRIC_LABELS: Record<DeviceMetric, string> = {
    meetings: "Number of meetings",
    users: "Number of users",
    hours: "Hours in use",
    connections: "Number of connections",
    posts: "Number of posts",
    avgLength: "Avg. length of meetings",
  };

  return (
    <div
      style={{
        fontFamily: "'Inter','Segoe UI',sans-serif",
        background: "#fff",
        minHeight: "100vh",
      }}
      className="text-black"
    >
      {/* ── Top Nav ── */}
      <div
        style={{
          borderBottom: "1px solid #e5e5e5",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginRight: 28,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "#6860C8",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="8" width="4" height="6" rx="1" fill="white" />
              <rect x="6" y="5" width="4" height="9" rx="1" fill="white" />
              <rect x="11" y="1" width="4" height="13" rx="1" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Analytics</span>
        </div>
        {(["Usage", "Monitoring", "Email Alerts"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              padding: "6px 4px",
              color: activeTab === tab ? "#6860C8" : "#888",
              borderBottom:
                activeTab === tab
                  ? "2px solid #6860C8"
                  : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #d0d0d0",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 500,
              background: "#fff",
              cursor: "pointer",
              color: "#333",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1v8M4 6l3 3 3-3M2 11h10"
                stroke="#555"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export to CSV
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "24px 28px" }}>
        {/* Usage header + time range */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Usage</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {TIME_RANGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                style={{
                  border: "1px solid",
                  borderRadius: 8,
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: timeRange === key ? "#6860C8" : "#fff",
                  color: timeRange === key ? "#fff" : "#333",
                  borderColor: timeRange === key ? "#6860C8" : "#d0d0d0",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Device Utilization ── */}
        <section
          style={{
            border: "1px solid #e8e8e8",
            borderRadius: 14,
            padding: "20px",
            marginBottom: 28,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            Device Utilization
          </h2>
          <p style={{ margin: "4px 0 20px", fontSize: 13, color: "#888" }}>
            Compare up to two types of usage data for devices in your
            organization
          </p>

          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={deviceData}>
                <CartesianGrid stroke="#efefef" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#888" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e5e5",
                          borderRadius: 8,
                          padding: 12,
                          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>
                          {label}
                        </div>
                        {payload.map((p) => (
                          <div
                            key={p.name}
                            style={{
                              color: p.color,
                              fontWeight: 500,
                              fontSize: 14,
                            }}
                          >
                            {p.name}: {p.value}
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />

                <Line
                  type="monotone"
                  dataKey={metricA}
                  stroke="#6860C8"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                  name={METRIC_LABELS[metricA]}
                />

                {metricB !== "none" && (
                  <Line
                    type="monotone"
                    dataKey={metricB}
                    stroke="#D44E80"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                    name={METRIC_LABELS[metricB]}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <select
              value={metricA}
              onChange={(e) => setMetricA(e.target.value as DeviceMetric)}
              style={{
                background: "#6860C8",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                fontWeight: 600,
              }}
            >
              {Object.entries(METRIC_LABELS).map(([key, label]) => (
                <option key={key} value={key} disabled={metricB === key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={metricB}
              onChange={(e) =>
                setMetricB(e.target.value as DeviceMetric | "none")
              }
              style={{
                background: "#D44E80",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                fontWeight: 600,
              }}
            >
              <option value="none">None</option>

              {Object.entries(METRIC_LABELS).map(([key, label]) => (
                <option key={key} value={key} disabled={metricA === key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ── User Connections ── */}
        <section
          style={{
            border: "1px solid #e8e8e8",
            borderRadius: 14,
            padding: "20px 20px 16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>
            User Connections
          </h2>
          <p style={{ margin: "3px 0 16px", fontSize: 12.5, color: "#888" }}>
            Compare connection modes, sharing protocols, user operating systems,
            and types of conferencing solutions used
          </p>

          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={connectionData}
                margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
              >
                <CartesianGrid stroke="#efefef" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
                  axisLine={false}
                  tickLine={false}
                  interval={interval}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 6, 12, 18, 24]}
                  domain={[0, 24]}
                />
                <Tooltip content={<ChartTooltip flipOrder />} />

                {/*
                 * ✅ BUG FIX: All <Area> components are ALWAYS rendered.
                 *    Hidden series show 0 values (via connectionData transform above).
                 *    This keeps the DOM/stack order stable — toggling checkboxes
                 *    can never reorder layers because no Area is ever unmounted.
                 *
                 *    Stack order = order of items[] in FILTER_GROUPS (bottom→top).
                 */}
                {currentGroup.items.map((item) => (
                  <Area
                    key={`${selectedGroupId}-${item.key}`}
                    type="linear"
                    dataKey={item.key}
                    name={item.label}
                    stackId="uc"
                    stroke="none"
                    strokeWidth={0}
                    fill={item.color}
                    fillOpacity={1}
                    isAnimationActive={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Controls row */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {/* Dropdown */}
            <div style={{ position: "relative" }}>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  border: "1px solid #d0d0d0",
                  borderRadius: 8,
                  padding: "6px 30px 6px 12px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: "#333",
                  background: "#fff",
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
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
                  <path
                    d="M1 1L5.5 6L10 1"
                    stroke="#666"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>

            {/* Checkboxes — legend order (top layer first = left in legend) */}
            {legendItems.map((item, idx) => (
              <React.Fragment key={item.key}>
                <CheckPill
                  item={item}
                  checked={currentActive[item.key]}
                  onToggle={() => toggleKey(selectedGroupId, item.key)}
                />
                {idx < legendItems.length - 1 && (
                  <span
                    style={{ color: "#ddd", fontSize: 18, userSelect: "none" }}
                  >
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
