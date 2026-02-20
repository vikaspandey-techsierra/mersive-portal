"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { pieData } from "@/lib/chartData";

export default function DonutChartComponent() {
  return (
    <div className="w-full h-100 pb-16 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Revenue Share</h2>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            innerRadius={60}
            outerRadius={100}
            fill="#2563eb"
            label
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
