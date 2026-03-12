"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ExternalLinkIcon } from "lucide-react";

interface Props {
  score: number;
  totalDevices: number;
  devicesWithIssues: number;
}

export default function FleetHealthGauge({
  score,
  totalDevices,
  devicesWithIssues,
}: Props) {
  const data = [
    { name: "Health", value: score },
    { name: "Rest", value: 10 - score },
  ];

  return (
    <div className="flex flex-col items-center justify-between text-[#090814] w-full max-md:flex-col">
      <div className="flex items-center justify-between text-[#090814] w-full max-md:flex-col">
        {/* Gauge */}
        <div className="w-78 h-48">
          <div className="relative w-78 h-92">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={115}
                  outerRadius={150}
                  dataKey="value"
                >
                  <Cell fill="#3F7F2F" />
                  <Cell fill="#E5E7EB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Score */}
          <div className="relative -top-68 text-center">
            <p className="text-[16px]">Health Score</p>
            <p className="text-[48px] font-semibold">{score}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 flex flex-col text-[16px] w-[45%] max-md:w-full my-4">
          <p className="flex items-center justify-between gap-1">
            Total devices
            <span className="font-bold ml-2">{totalDevices}</span>
          </p>

          <p className="flex items-center justify-between gap-1">
            Devices with issues
            <span className="font-bold text-red-600 ml-2">
              {devicesWithIssues}
            </span>
          </p>
        </div>
      </div>

      <button className="mt-3 px-4 py-2 border border-[#C6C5D3] rounded-lg text-[16px] flex items-center">
        Show devices with issues
        <ExternalLinkIcon size={12} className="ml-1" />
      </button>
    </div>
  );
}
