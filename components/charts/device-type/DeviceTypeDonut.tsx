"use client";

import { DeviceTypeDonutProps } from "@/lib/types/homepage";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#5B84C4", "#D97706", "#8B5CF6"];

export default function DeviceTypeDonut({ data }: DeviceTypeDonutProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex items-center justify-between text-[#090814] w-full max-md:flex-col">
      <div className="w-55 h-55 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={70} outerRadius={100} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[16px]">Total Devices</p>
          <p className="text-[34px] font-semibold">{total}</p>
        </div>
      </div>

      <div className="ml-6 space-y-4 w-[50%] max-md:w-full">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-6">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="flex-1 text-[16px]">{d.name}</span>
            <span className="text-[20px] font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
