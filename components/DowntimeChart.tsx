"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { formatShortDate } from "@/lib/analytics/utils/helpers";
import { useFilteredDowntimeChart } from "@/lib/analytics/hooks/useTimeSeriesMetrics";

export interface DowntimePoint {
  date: string;
  devices: number;
  hours: number;
}

interface Props {
  /** Pre-aggregated fleet-total data from useDowntimeChart — used as fallback when no device filter */
  data: DowntimePoint[];
  interval: number;
  /** Must be forwarded from MonitoringPage so the filtered hook knows the date window */
  timeRange: string;
  ready: boolean;
  selectedDeviceNames?: string[];
}

const PURPLE = "#5E54C5";
const PINK = "#C55483";

const LeftAxisLabel = ({
  viewBox,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
}) => {
  if (!viewBox) return null;
  const cx = viewBox.x - 34;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={PURPLE}
      fontSize={16}
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
  const cx = viewBox.x + viewBox.width + 44;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={PINK}
      fontSize={16}
      fontWeight={500}
      textAnchor="middle"
      transform={`rotate(90, ${cx}, ${cy})`}
    >
      Number of hours
    </text>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; stroke: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        fontSize: 13,
      }}
    >
      <p style={{ fontWeight: 600, color: "#111", margin: "0 0 6px" }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.stroke, margin: "3px 0" }}>
          {p.dataKey === "devices"
            ? `Devices: ${p.value}`
            : `Hours: ${Number(p.value).toFixed(1)} hr`}
        </p>
      ))}
    </div>
  );
};

export default function DowntimeChart({
  data,
  timeRange,
  ready,
  selectedDeviceNames = [],
}: Props) {
  /**
   * When selectedDeviceNames is empty  → hook returns `data` (the store value) unchanged.
   * When devices are selected          → hook re-aggregates raw mock rows for those devices.
   */
  const { data: filteredData } = useFilteredDowntimeChart(
    timeRange,
    ready,
    selectedDeviceNames,
  );

  const activeData = selectedDeviceNames.length > 0 ? filteredData : data;

  const formattedData = activeData.map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  const deviceTicks = [0, 6, 12, 18, 24];

  const xTicks = (() => {
    const len = formattedData.length;
    if (len === 0) return [];
    const count = 7;
    const sel = new Set<number>([0, len - 1]);
    for (let i = 1; i < count - 1; i++)
      sel.add(Math.round((i / (count - 1)) * (len - 1)));
    return [...sel].sort((a, b) => a - b).map((i) => formattedData[i].label);
  })();

  const maxHours =
    formattedData.length > 0
      ? Math.max(...formattedData.map((d) => d.hours), 1)
      : 1;

  const hourTicks = [0, 0.25, 0.5, 0.75, 1].map((f) =>
    Number((maxHours * f).toFixed(1)),
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 pt-5 pb-5 w-full">
      <div className="px-6 mb-2">
        <h2 className="text-base font-bold text-black">Downtime</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Monitor how many devices are down and for how long the downtime lasted
        </p>
      </div>

      <div className="w-full h-80 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 68, left: 52, bottom: 4 }}
          >
            <XAxis
              dataKey="label"
              ticks={xTicks}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, 24]}
              ticks={deviceTicks}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={36}
              label={<LeftAxisLabel />}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, maxHours]}
              ticks={hourTicks}
              tickFormatter={(v: number) => `${v.toFixed(1)} hr`}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={52}
              label={<RightAxisLabel />}
            />

            {deviceTicks.map((tick) => (
              <ReferenceLine
                key={tick}
                yAxisId="left"
                y={tick}
                stroke="#E5E7EB"
                strokeWidth={1}
              />
            ))}

            <Tooltip content={<CustomTooltip />} />

            <Line
              yAxisId="left"
              type="linear"
              dataKey="devices"
              stroke={PURPLE}
              strokeWidth={2.5}
              dot={{ r: 5, fill: PURPLE, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: PURPLE }}
              isAnimationActive={false}
            />

            <Line
              yAxisId="right"
              type="linear"
              dataKey="hours"
              stroke={PINK}
              strokeWidth={2.5}
              dot={{ r: 5, fill: PINK, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: PINK }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2.5 px-6 mt-4">
        <span
          className="inline-flex items-center text-white text-sm font-medium rounded-full px-4 py-1.5"
          style={{ background: PURPLE }}
        >
          Number of devices
        </span>
        <span
          className="inline-flex items-center text-white text-sm font-medium rounded-full px-4 py-1.5"
          style={{ background: PINK }}
        >
          Number of hours
        </span>
      </div>
    </div>
  );
}
