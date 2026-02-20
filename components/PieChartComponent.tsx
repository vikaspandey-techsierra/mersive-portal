"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { pieData } from "@/lib/chartData";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626"];

export default function PieChartComponent() {
  return (
    <div className="w-full h-100 pb-16 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Sales by Category</h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            label
          >
            {pieData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
