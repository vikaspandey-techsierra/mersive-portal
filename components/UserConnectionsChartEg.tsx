"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function UserConnectionsChart({ data }: { data: any[] }) {
  return (
    <div className="h-100 pb-12 bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">User Connections</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Web" stackId="a" fill="#2563eb" />
          <Bar dataKey="AirPlay" stackId="a" fill="#16a34a" />
          <Bar dataKey="Miracast" stackId="a" fill="#f59e0b" />
          <Bar dataKey="Google Cast" stackId="a" fill="#9333ea" />
          <Bar dataKey="HDMI" stackId="a" fill="#dc2626" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
