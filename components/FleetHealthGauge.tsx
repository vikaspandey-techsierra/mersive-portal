"use client";

import { fleetHealth } from "@/lib/breakdownData";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ExternalLinkIcon } from "lucide-react";

export default function FleetHealthGauge() {
  const data = [
    { name: "Health", value: fleetHealth.score },
    { name: "Rest", value: 10 - fleetHealth.score },
  ];

  return (
    <div  className="flex flex-col items-center justify-between text-[#090814] w-full max-md:flex-col">
     <div className="flex items-center justify-between text-[#090814] w-full max-md:flex-col ">
       <div className="w-78 h-48 ">
       <div className=" relative w-78 h-92 ">
         <ResponsiveContainer>
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

        <div className="relative -top-68 text-center">
          <p className="text-[16px]">Health Score</p>
          <p className="text-[48px] font-semibold">{fleetHealth.score}</p>
        </div>
      </div>
      <div className="space-y-2 flex flex-col items-between text-[16px] w-[45%]  max-md:w-full my-4 ">
        <p className="flex items-center justify-between gap-1">
          Online devices{" "}
          <span className="font-bold ml-2">{fleetHealth.online}</span>
        </p>
        <p className="flex items-center justify-between gap-1">
          Devices with issues{" "}
          <span className="font-bold text-red-600 ml-2">
            {fleetHealth.issues}
          </span>
        </p>
      </div>
     </div>
       <button className="mt-3 px-4 py-2 border border-[#C6C5D3] rounded-lg text-[16px] flex items-center ">
          Show devices with issues <ExternalLinkIcon size={12} className="ml-1" />
        </button>
    </div>
  );
}
