"use client";

import { fleetHealth } from "@/lib/breakdownData";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function FleetHealthGauge() {
  const data = [
    { name: "Health", value: fleetHealth.score },
    { name: "Rest", value: 10 - fleetHealth.score },
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="w-72 h-65">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              startAngle={180}
              endAngle={0}
              innerRadius={70}
              outerRadius={100}
              dataKey="value"
            >
              <Cell fill="#3F7F2F" />
              <Cell fill="#E5E7EB" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="relative -top-24 text-center">
          <p className="text-sm text-gray-500">Health Score</p>
          <p className="text-4xl font-bold">{fleetHealth.score}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p>
          Online devices{" "}
          <span className="font-bold ml-2">{fleetHealth.online}</span>
        </p>
        <p>
          Devices with issues{" "}
          <span className="font-bold text-red-600 ml-2">
            {fleetHealth.issues}
          </span>
        </p>

        <button className="mt-3 px-4 py-2 border rounded-lg text-sm">
          Show devices with issues ↗
        </button>
      </div>
    </div>
  );
}
