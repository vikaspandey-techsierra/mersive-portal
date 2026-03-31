"use client";

import { DeviceStatusPieProps } from "@/lib/types/homepage";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#5B84C4", "#8B5CF6", "#D97706"];

export default function DeviceStatusPie({ data }: DeviceStatusPieProps) {
  return (
    <div className="flex items-center justify-between w-full max-md:flex-col">
      <div className="w-55 h-55">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" outerRadius={100}>
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="ml-6 space-y-4 w-[50%] max-md:w-full">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-6">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 text-[16px]">{d.name}</span>
            <span className="text-[20px] font-semibold">
              {d.value} ({d.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
