"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4000, profit: 2400, cost: 1600 },
  { month: "Feb", revenue: 3000, profit: 1398, cost: 1602 },
  { month: "Mar", revenue: 5000, profit: 2800, cost: 2200 },
  { month: "Apr", revenue: 4780, profit: 3200, cost: 1580 },
  { month: "May", revenue: 5890, profit: 3900, cost: 1990 },
];

export default function MultiLineChart() {
  return (
    <div className="w-full h-100 pb-16  bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">KPI Trends</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Line dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
          <Line dataKey="profit" stroke="#16a34a" strokeWidth={2} />
          <Line dataKey="cost" stroke="#dc2626" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
