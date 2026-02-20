"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Props {
  title: string;
  data: { name: string; value: number }[];
  centerLabel?: string;
  centerValue?: string | number;
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#6366f1",
];

export default function PieChartCard({
  title,
  data,
  centerLabel,
  centerValue,
}: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h3 className="text-sm font-semibold mb-4">{title}</h3>

      <div className="flex items-center">
        {/* Chart */}
        <div className="w-45 h-45 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          {centerValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500">{centerLabel}</span>
              <span className="text-lg font-bold">{centerValue}</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="ml-6 space-y-2 text-sm">
          {data.map((item, index) => {
            const percent = ((item.value / total) * 100).toFixed(0);

            return (
              <div
                key={index}
                className="flex items-center justify-between w-45"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {item.name}
                </div>

                <span className="font-medium">
                  {item.value} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
