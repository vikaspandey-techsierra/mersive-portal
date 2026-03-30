"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useCollaborationUsageMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import { formatShortDate, getSevenTicks } from "@/lib/analytics/utils/helpers";
import { ChartTooltip } from "./charts/ChartsTooltip";
import { LegendPill } from "./charts/LegendPill";

export default function CollaborationUsage({
  orgId,
  timeRange = "7d",
  selectedDevices,
}: {
  orgId: string;
  timeRange?: string;
  selectedDevices: Set<string>;
}) {
  const { connectionsAvg, postsAvg } = useCollaborationUsageMetrics(
    orgId,
    timeRange,
    selectedDevices
  );

  const chartData = useMemo(() => {
    if (!connectionsAvg.length && !postsAvg.length) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map: Record<string, any> = {};
    connectionsAvg.forEach((d) => {
      if (!map[d.date]) map[d.date] = { label: formatShortDate(d.date) };
      map[d.date].avgConnections = d.value;
    });
    postsAvg.forEach((d) => {
      if (!map[d.date]) map[d.date] = { label: formatShortDate(d.date) };
      map[d.date].avgPosts = d.value;
    });
    return Object.entries(map)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([, v]) => v);
  }, [connectionsAvg, postsAvg]);

  const xTicks = useMemo(
    () => getSevenTicks(chartData.map((d) => d.label)),
    [chartData]
  );

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">
        Collaboration Usage
      </div>
      <div className="text-[13px] text-gray-400 mb-3">
        Compare how many users connect versus how often they share a post within
        a meeting on average
      </div>
      <div className="bg-white rounded-xl p-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              axisLine={false}
              tickLine={false}
              ticks={xTicks}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#000" }}
              axisLine={false}
              tickLine={false}
              tickCount={5}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="linear"
              dataKey="avgConnections"
              name="Avg. connections per meeting"
              stroke="#6860C8"
              strokeWidth={2}
              dot={{ r: 4, fill: "#6860C8", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="linear"
              dataKey="avgPosts"
              name="Avg. posts per meeting"
              stroke="#D44E80"
              strokeWidth={2}
              dot={{ r: 4, fill: "#D44E80", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-2 mt-3.5 flex-wrap items-center">
          <LegendPill label="Avg. connections per meeting" color="#6860C8" />
          <LegendPill label="Avg. posts per meeting" color="#D44E80" />
        </div>
      </div>
    </div>
  );
}
