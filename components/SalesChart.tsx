"use client";

import { barData } from "@/lib/chartData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart() {
  return (
    <div className="w-full h-100 pb-16 bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Monthly Sales</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="users" stroke="#2563eb" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
