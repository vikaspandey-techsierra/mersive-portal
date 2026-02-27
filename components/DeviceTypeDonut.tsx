"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export interface DeviceTypeItem {
  name: string;
  value: number;
}

export interface DeviceTypeApiResponse {
  asOf: string;
  totalDevices: number;
  deviceTypes: DeviceTypeItem[];
}

interface Props {
  data: DeviceTypeApiResponse;
}

const COLORS = ["#5B84C4", "#D97706", "#8B5CF6"];

export default function DeviceTypeDonut({ data }: Props) {
  if (!data.deviceTypes || data.deviceTypes.length === 0) {
    return <div>No device data available</div>;
  }

  return (
    <div className="flex items-center justify-between text-[#090814] w-[90%] max-md:flex-col">
      <div className="w-57 h-57 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.deviceTypes}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
            >
              {data.deviceTypes.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[16px]">Total Devices</p>
          <p className="text-[34px] font-semibold">
            {data.totalDevices}
          </p>
        </div>
      </div>

      <div className="ml-6 space-y-4 w-[50%] max-md:w-full">
        {data.deviceTypes.map((d, i) => (
          <div key={d.name} className="flex items-center gap-6">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: COLORS[i] }}
            />
            <span className="flex-1 text-[16px]">{d.name}</span>
            <span className="text-[20px] font-semibold">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}