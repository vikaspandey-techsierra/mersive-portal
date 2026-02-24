"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { deviceTypeData } from "../lib/breakdownData";

const COLORS = ["#5B84C4", "#D97706", "#8B5CF6"];

export default function DeviceTypeDonut() {
  const total = deviceTypeData.reduce((a, b) => a + b.value, 0);

  return (
    <div className="flex items-center justify-between text-[#090814] w-[90%] ">
      <div className="w-57 h-57 relative ">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={deviceTypeData}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
            >
              {deviceTypeData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[16px] ">Total Devices</p>
          <p className="text-[34px] font-semibold">{total}</p>
        </div>
      </div>

      <div className="ml-6 space-y-4 w-[50%] ">
        {deviceTypeData.map((d, i) => (
          <div key={d.name} className="flex items-center gap-6">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i] }}
            />
            <span className="flex-1 text-[16px] ">{d.name}</span>
            <span className="text-[20px] font-semibold ">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
