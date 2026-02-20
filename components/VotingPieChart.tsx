"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";

export default function VotingPieChart({ data }: { data: any[] }) {
  return (
    <div className="h-80 bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-2">Party Distribution</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" label />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
