"use client";

import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DeviceUtilizationChart({ data }: { data: any[] }) {
  return (
    <div className="h-100 pb-12 bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">Device Utilization</h2>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="meetings" fill="#2563eb" />
          <Line dataKey="connections" stroke="#dc2626" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
