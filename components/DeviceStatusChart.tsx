// components/charts/DeviceStatusChart.tsx
"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { DeviceStatusCount } from "@/lib/types/dashboard";

const COLORS = ["#4CAF50", "#2196F3", "#F44336"];

interface DeviceStatusChartProps {
  data: DeviceStatusCount[];
}

export const DeviceStatusChart: React.FC<DeviceStatusChartProps> = ({
  data,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Device Status</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="status"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const item = data.find(
                  (d) => d.status === props.payload.status,
                );
                return [`${value} devices (${item?.percentage}%)`, "Status"];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
