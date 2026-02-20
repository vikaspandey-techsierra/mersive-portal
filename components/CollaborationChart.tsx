"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CollaborationChart({ data }: { data: any[] }) {
  return (
    <div className="h-100 pb-12 bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">Collaboration Usage</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line dataKey="avgConnections" stroke="#2563eb" />
          <Line dataKey="avgPosts" stroke="#16a34a" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
