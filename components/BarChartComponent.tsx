"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { barData } from "@/lib/chartData";

export default function BarChartComponent() {
  return (
    <div className="w-full h-100 pb-16 bg-white p-4 rounded-xl shadow ">
      <h2 className="text-lg font-semibold mb-4">Monthly Users</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="users" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
