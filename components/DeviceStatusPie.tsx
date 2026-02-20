"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { deviceStatusData } from "../lib/breakdownData";

const COLORS = ["#5B84C4", "#8B5CF6", "#D97706"];

export default function DeviceStatusPie() {
  const total = deviceStatusData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="flex">
      <div className="w-64 h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={deviceStatusData} dataKey="value" outerRadius={100}>
              {deviceStatusData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="ml-6 space-y-3">
        {deviceStatusData.map((d, i) => (
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
