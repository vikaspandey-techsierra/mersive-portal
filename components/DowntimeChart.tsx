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

export interface DowntimePoint {
  date: string; 
  devices: number;
  hours: number;
}

interface Props {
  data: DowntimePoint[];
  interval: number;
}

const PURPLE = "#6860C8";
const PINK   = "#D05A8A";

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
      x={cx} y={cy}
      fill={PURPLE} fontSize={12} fontWeight={500}
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
      x={cx} y={cy}
      fill={PINK} fontSize={12} fontWeight={500}
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
    <div style={{
      background: "white", border: "1px solid #E5E7EB",
      borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)", fontSize: 13,
    }}>
      <p style={{ fontWeight: 600, color: "#111", margin: "0 0 6px" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.stroke, margin: "3px 0" }}>
          {p.dataKey === "devices" ? `Devices: ${p.value}` : `Hours: ${p.value} hr`}
        </p>
      ))}
    </div>
  );
};

export default function DowntimeChart({ data, interval }: Props) {
  const deviceTicks = [0, 6, 12, 18, 24];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 pt-5 pb-5">

      <div className="px-6 mb-2">
        <h2 className="text-base font-bold text-black">Downtime</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Monitor how many devices are down and for long the downtime lasted
        </p>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 68, left: 52, bottom: 4 }}
          >
            <XAxis
              dataKey="date"
              interval={interval}
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
              domain={[1, 2]}
              ticks={[1, 1.25, 1.5, 1.75, 2]}
              tickFormatter={(v: number) => `${v} hr`}
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
            />

            <Line
              yAxisId="right"
              type="linear"
              dataKey="hours"
              stroke={PINK}
              strokeWidth={2.5}
              dot={{ r: 5, fill: PINK, strokeWidth: 0 }}
              activeDot={{ r: 7, fill: PINK }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
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