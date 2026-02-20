"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { skill: "React", value: 90 },
  { skill: "Next", value: 85 },
  { skill: "Node", value: 70 },
  { skill: "UI", value: 80 },
];

export default function RadarChartComponent() {
  return (
    <div className="w-full h-100 pb-16 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Skill Radar</h2>

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={performanceData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis />
          <Radar
            dataKey="value"
            stroke="#2563eb"
            fill="#93c5fd"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
