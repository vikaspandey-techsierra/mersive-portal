"use client";

import { DeviceUtilizationPoint } from "@/components/analytics/usage/page";
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
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
      <div className="font-semibold mb-1 text-gray-800">
        {label}
      </div>
      {payload.map((e) => (
        <div key={e.name} className="mt-1" style={{ color: e.color }}>
          {e.name}: {e.value}
        </div>
      ))}
    </div>
  );
};

// LEGEND
const LegendPill = ({ label, color }: { label: string; color: string }) => (
  <div
    className="inline-flex items-center text-white rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap"
    style={{ background: color }}
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
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">
        Collaboration Usage
      </div>

      <div className="text-[13px] text-gray-400 mb-3">
        Compare how many users connect versus how often they share a post within
        a meeting on average
      </div>

      <div className="bg-white rounded-xl p-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray=""
              stroke="#f0f0f0"
              vertical={false}
            />

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

        <div className="flex gap-2 mt-3.5 flex-wrap items-center">
          <LegendPill
            label="Avg. connections per meeting"
            color="#6860C8"
          />
          <LegendPill
            label="Avg. posts per meeting"
            color="#D44E80"
          />
        </div>
      </div>
    </div>
  );
}