"use client";

import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", sales: 400, target: 450, growth: 300 },
  { month: "Feb", sales: 300, target: 400, growth: 200 },
  { month: "Mar", sales: 500, target: 480, growth: 350 },
  { month: "Apr", sales: 700, target: 600, growth: 500 },
];

export default function ComposedChartComponent() {
  return (
    <div className="w-full h-100 pb-16  bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Sales Performance</h2>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />

          <Area dataKey="growth" fill="#bbf7d0" stroke="#16a34a" />
          <Bar dataKey="sales" fill="#2563eb" />
          <Line dataKey="target" stroke="#dc2626" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
