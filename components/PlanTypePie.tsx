"use client";

import { PlanTypePieProps } from "@/lib/types/homepage";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = [
  "#5B84C4",
  "#8B5CF6",
  "#D97706",
  "#EC4899",
  "#84CC16",
  "#9333EA",
];

export default function PlanTypePie({ data }: PlanTypePieProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-55 text-gray-400">
        No plan data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex items-center justify-between text-[#090814] w-[90%] max-md:flex-col">
      {/* Chart */}
      <div className="w-64 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={100}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="ml-6 space-y-2 text-sm w-[50%] max-md:w-full">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1">{d.name}</span>
            <span className="font-semibold">
              {d.value} ({Math.round((d.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
