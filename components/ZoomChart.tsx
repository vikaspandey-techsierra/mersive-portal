"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Brush,
  ResponsiveContainer,
} from "recharts";

const data = Array.from({ length: 50 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  value: Math.floor(Math.random() * 1000),
}));

export default function ZoomChart() {
  return (
    <div className="w-full h-100 pb-16  bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Zoomable Data</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line dataKey="value" stroke="#2563eb" />
          <Brush dataKey="day" height={30} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
