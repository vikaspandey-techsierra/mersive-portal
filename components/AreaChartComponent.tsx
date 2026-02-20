"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { barData } from "@/lib/chartData";

export default function AreaChartComponent() {
  return (
    <div className="w-full h-100 pb-16 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Growth Trend</h2>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#16a34a"
            fill="#86efac"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
