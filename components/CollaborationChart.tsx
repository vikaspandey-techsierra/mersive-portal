"use client";

import { DeviceUtilizationPoint } from "@/components/analytics/usage/page";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// HELPERS
function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// TOOLTIP
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
      {payload.map((e) => (
        <div key={e.name} style={{ color: e.color, marginTop: 2 }}>
          {e.name}: {e.value}
        </div>
      ))}
    </div>
  );
};


const LegendPill = ({ label, color }: { label: string; color: string }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      background: color,
      color: "#fff",
      borderRadius: 6,
      padding: "5px 12px",
      fontSize: 12,
      fontWeight: 500,
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

// PROPS
interface CollaborationUsageProps {
  data: DeviceUtilizationPoint[];
  interval: number;
}

export default function CollaborationUsage({
  data,
  interval,
}: CollaborationUsageProps) {
  const chartData = data.map((d) => ({
    label: fmtDate(d.date),
    avgConnections: d.connections,
    avgPosts: Math.round(d.meetings * 0.8),
  }));

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{ fontWeight: 600, fontSize: 15, marginBottom: 2, color: "#000" }}
      >
        Collaboration Usage
      </div>
      <div style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>
        Compare how many users connect versus how often they share a post within
        a meeting on average
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
          <LineChart
            data={chartData}
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
              tickCount={5}
            />

            <Tooltip content={<ChartTooltip />} />

            <Line
              type="linear"
              dataKey="avgConnections"
              name="Avg. connections per meeting"
              stroke="#6860C8"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6860C8", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />

            <Line
              type="linear"
              dataKey="avgPosts"
              name="Avg. posts per meeting"
              stroke="#D44E80"
              strokeWidth={2}
              dot={{ r: 4, fill: "#D44E80", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <LegendPill label="Avg. connections per meeting" color="#6860C8" />
          <LegendPill label="Avg. posts per meeting" color="#D44E80" />
        </div>
      </div>
    </div>
  );
}