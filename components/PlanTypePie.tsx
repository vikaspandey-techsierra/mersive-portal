"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { planTypeData } from "../lib/breakdownData";

const COLORS = [
  "#5B84C4",
  "#8B5CF6",
  "#D97706",
  "#EC4899",
  "#84CC16",
  "#9333EA",
];

export default function PlanTypePie() {
  const total = planTypeData.reduce((a, b) => a + b.value, 0);

  return (
     <div className="flex items-center justify-between text-[#090814] w-[90%] ">
      <div className="w-64 h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={planTypeData} dataKey="value" outerRadius={100}>
              {planTypeData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="ml-6 space-y-2 text-sm w-[50%] ">
        {planTypeData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i] }}
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
