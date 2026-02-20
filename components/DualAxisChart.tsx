"use client";

import {
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", users: 200, revenue: 4000 },
  { month: "Feb", users: 300, revenue: 3000 },
  { month: "Mar", users: 250, revenue: 5000 },
  { month: "Apr", users: 400, revenue: 7000 },
];

export default function DualAxisChart() {
  return (
    <div className="w-full h-100 pb-16  bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Users vs Revenue</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />

          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />

          <Tooltip />

          <Bar yAxisId="left" dataKey="users" fill="#2563eb" />
          <Line yAxisId="right" dataKey="revenue" stroke="#dc2626" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
