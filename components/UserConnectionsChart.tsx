"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { timeseriesMock } from "@/lib/analytics/mock/timeseriesMock";
import { useFilteredUserConnectionsMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";

const COLOR_PALETTE = ["#6860C8", "#D44E80", "#4D9EC4", "#7E9E2E", "#E8902A"];

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
      <div className="font-semibold mb-1 text-black">{label}</div>
      {payload
        .filter((e) => e.value > 0)
        .map((e) => (
          <div key={e.name} style={{ color: e.color }}>
            {e.name}: {e.value}
          </div>
        ))}
    </div>
  );
};

export default function UserConnections({
  timeRange = "7d",
  title,
  subtitle,
  selectedDeviceNames = [],
}: {
  timeRange?: string;
  title: string;
  subtitle?: string;
  selectedDeviceNames?: string[];
}) {
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  // Build dropdown from all segment_1_name values in raw mock
  const availableDimensions = (() => {
    const map = new Map<string, string>();
    timeseriesMock.forEach((row) => {
      if (!row.segment_1_name) return;
      if (!map.has(row.segment_1_name))
        map.set(row.segment_1_name, row.metric_name);
    });
    return Array.from(map.entries()).map(([label, metric]) => ({
      label,
      metric,
    }));
  })();

  const activeMetric = selectedMetric || availableDimensions[0]?.metric || "";

  // Hook handles all filtering + aggregation by device and time range
  const { segments, chartRows } = useFilteredUserConnectionsMetrics(
    activeMetric,
    timeRange,
    selectedDeviceNames,
  );

  const segmentColorMap: Record<string, string> = {};
  segments.forEach((s, i) => {
    segmentColorMap[s] = COLOR_PALETTE[i % COLOR_PALETTE.length];
  });

  const [activeSegments, setActiveSegments] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSegments((prev) => {
      const next: Record<string, boolean> = {};
      segments.forEach((s) => {
        next[s] = prev[s] ?? true;
      });
      return next;
    });
  }, [segments]);

  // Convert chartRows to recharts-ready format with formatted date labels
  const chartData = chartRows.map((row) => ({
    ...row,
    label: fmtDate(row.date),
  }));

  return (
    <div className="mb-8 w-full">
      <div className="text-[15px] font-semibold text-black mb-1">{title}</div>
      <div className="text-[13px] text-gray-400 mb-3">{subtitle}</div>

      <div className="bg-white rounded-xl p-5 border border-gray-200">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData}>
            <CartesianGrid stroke="#f0f0f0" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              axisLine={false}
              tickLine={false}
              ticks={(() => {
                const len = chartData.length;
                if (len === 0) return [];
                const count = 7;
                const sel = new Set<number>([0, len - 1]);
                for (let i = 1; i < count - 1; i++)
                  sel.add(Math.round((i / (count - 1)) * (len - 1)));
                return [...sel]
                  .sort((a, b) => a - b)
                  .map((i) => chartData[i].label);
              })()}
            />

            <YAxis
              tick={{ fontSize: 11, fill: "#000" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />

            {segments.map((segment) => (
              <Area
                key={segment}
                type="linear"
                dataKey={segment}
                stackId="1"
                stroke={segmentColorMap[segment]}
                fill={segmentColorMap[segment]}
                fillOpacity={(activeSegments[segment] ?? true) ? 0.9 : 0}
                strokeOpacity={(activeSegments[segment] ?? true) ? 1 : 0}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex items-center gap-3 mt-3.5 flex-wrap">
          <select
            value={activeMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded-md px-2.5 py-1.5 text-[13px] text-black bg-white font-medium"
          >
            {availableDimensions.map((item) => (
              <option key={item.metric} value={item.metric}>
                {item.label}
              </option>
            ))}
          </select>

          {segments.map((segment) => (
            <label
              key={segment}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeSegments[segment] ?? true}
                onChange={() =>
                  setActiveSegments((prev) => ({
                    ...prev,
                    [segment]: !prev[segment],
                  }))
                }
              />
              <span
                className="px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: segmentColorMap[segment] }}
              >
                {segment}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
