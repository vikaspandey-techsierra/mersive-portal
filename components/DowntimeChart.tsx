"use client";

/**
 * DowntimeChart.tsx
 *
 * Dual-axis line chart for the Monitoring > Downtime section.
 *
 * Data fields (canonical names from analytics.ts):
 *   ts_downtime_duration_tot     — total downtime hours (left axis)
 *   ts_downtime_devices_num_tot  — number of devices down (right axis, FE-derived)
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DowntimePoint } from "@/lib/analytics";

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

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

// ─── Axis labels ──────────────────────────────────────────────────────────────

const PURPLE = "#6860C8";
const PINK = "#D44E80";

const LeftAxisLabel = ({
  viewBox,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
}) => {
  if (!viewBox) return null;
  const cx = viewBox.x - 1;
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
      Number of devices
    </text>
  );
};

const RightAxisLabel = ({
  viewBox,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
}) => {
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
      Number of hours
    </text>
  );
};

// ─── Legend pill ─────────────────────────────────────────────────────────────

const LegendPill = ({ color, label }: { color: string; label: string }) => (
  <span
    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white rounded-md px-3 py-1"
    style={{ background: color }}
  >
    {label}
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface DowntimeChartProps {
  data: DowntimePoint[];
  interval: number;
}

export default function DowntimeChart({ data, interval }: DowntimeChartProps) {
  const chartData = data.map((d) => ({
    label: fmtDate(d.date),
    // canonical field → chart dataKey
    ts_downtime_devices_num_tot: d.ts_downtime_devices_num_tot,
    ts_downtime_duration_tot: parseFloat(d.ts_downtime_duration_tot.toFixed(2)),
  }));

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">
        Downtime
      </div>
      <div className="text-[13px] text-gray-400 mb-3">
        Monitor how many devices are down and for how long the downtime lasted
      </div>

      <div className="bg-white rounded-xl py-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 40, left: 24, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              interval={interval}
              axisLine={false}
              tickLine={false}
            />
            {/* Left axis — ts_downtime_devices_num_tot */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={32}
              label={<LeftAxisLabel />}
            />
            {/* Right axis — ts_downtime_duration_tot (hours) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={36}
              tickFormatter={(v: number) =>
                `${v % 1 === 0 ? v : v.toFixed(1)}hr`
              }
              label={<RightAxisLabel />}
            />
            <Tooltip content={<ChartTooltip />} />

            {/* ts_downtime_devices_num_tot — Number of devices */}
            <Line
              yAxisId="left"
              type="linear"
              dataKey="ts_downtime_devices_num_tot"
              name="Number of devices"
              stroke={PURPLE}
              strokeWidth={2}
              dot={{ r: 4, fill: PURPLE, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            {/* ts_downtime_duration_tot — Number of hours */}
            <Line
              yAxisId="right"
              type="linear"
              dataKey="ts_downtime_duration_tot"
              name="Number of hours"
              stroke={PINK}
              strokeWidth={2}
              dot={{ r: 4, fill: PINK, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="flex gap-2.5 mt-3.5 flex-wrap items-center px-6">
          <LegendPill color={PURPLE} label="Number of devices" />
          <LegendPill color={PINK} label="Number of hours" />
        </div>
      </div>
    </div>
  );
}
