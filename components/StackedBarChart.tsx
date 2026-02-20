"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", mobile: 400, web: 300, api: 200 },
  { month: "Feb", mobile: 300, web: 200, api: 100 },
  { month: "Mar", mobile: 500, web: 400, api: 300 },
  { month: "Apr", mobile: 200, web: 300, api: 250 },
];

export default function StackedBarChart() {
  return (
    <div className="w-full h-100 pb-16  bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Platform Revenue</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />

          <Bar dataKey="mobile" stackId="a" fill="#2563eb" />
          <Bar dataKey="web" stackId="a" fill="#16a34a" />
          <Bar dataKey="api" stackId="a" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
