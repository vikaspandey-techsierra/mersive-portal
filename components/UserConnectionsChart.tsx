"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUserConnectionsMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import {
  buildAvailableDimensions,
  formatShortDate,
  getSevenTicks,
} from "@/lib/analytics/utils/helpers";
import { ChartTooltip } from "./charts/ChartsTooltip";
import { ChartRow, UserConnectionsProp } from "@/lib/types/charts";

const COLOR_PALETTE = ["#6860C8", "#D44E80", "#4D9EC4", "#7E9E2E", "#E8902A"];

const AVAILABLE_DIMENSIONS = buildAvailableDimensions();

export default function UserConnections({
  orgId,
  timeRange = "7d",
  title,
  subtitle,
  selectedDevices,
}: UserConnectionsProp) {
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const selected = selectedMetric || AVAILABLE_DIMENSIONS[0]?.metric || "";

  const metricData = useUserConnectionsMetrics(
    orgId,
    selected,
    timeRange,
    selectedDevices
  );

  const segments = useMemo(() => {
    if (!metricData.length) return [];
    return Array.from(
      new Set(metricData.map((d) => d.segment).filter(Boolean))
    ) as string[];
  }, [metricData]);

  const segmentColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    segments.forEach((s, i) => {
      map[s] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    });
    return map;
  }, [segments]);

  const [activeSegments, setActiveSegments] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (!segments.length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveSegments((prev) => {
      const next: Record<string, boolean> = {};
      segments.forEach((s) => {
        next[s] = prev[s] ?? true;
      });
      return next;
    });
  }, [segments]);

  const chartData = useMemo<ChartRow[]>(() => {
    if (!metricData.length || segments.length === 0) return [];
    const map: Record<string, ChartRow> = {};
    metricData.forEach((row) => {
      if (!map[row.date]) {
        map[row.date] = { label: formatShortDate(row.date) };
        segments.forEach((seg) => {
          map[row.date][seg] = 0;
        });
      }
    });
    metricData.forEach((row) => {
      if (!row.segment) return;
      if (activeSegments[row.segment] ?? true) {
        map[row.date][row.segment] =
          ((map[row.date][row.segment] as number) || 0) + row.value;
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([, v]) => v);
  }, [metricData, segments, activeSegments]);

  const xTicks = useMemo(
    () => getSevenTicks(chartData.map((d) => d.label as string)),
    [chartData]
  );

  return (
    <div className="mb-8 w-full">
      <div className="text-[15px] font-semibold text-black mb-1">{title}</div>
      <div className="text-[13px] text-gray-400 mb-3">{subtitle}</div>
      <div className="bg-white rounded-xl p-5 border border-gray-200">
        {!chartData.length ? (
          <div className="flex items-center justify-center h-55 text-2xl text-gray-400">
            No data available
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
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
                />
                <Tooltip content={<ChartTooltip />} />
                {segments.map((segment) => (
                  <Area
                    key={segment}
                    type="linear"
                    dataKey={segment}
                    stackId="1"
                    stroke={segmentColorMap[segment]}
                    fill={segmentColorMap[segment]}
                    fillOpacity={0.9}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex items-center gap-3 mt-3.5 flex-wrap">
              <select
                value={selected}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="border border-gray-300 rounded-md px-2.5 py-1.5 text-[13px] text-black bg-white font-medium"
              >
                {AVAILABLE_DIMENSIONS.map((item) => (
                  <option key={item.metric} value={item.metric}>
                    {item.label}
                  </option>
                ))}
              </select>

              {segments.map((segment) => {
                const activeCount =
                  Object.values(activeSegments).filter(Boolean).length;
                const isChecked = activeSegments[segment] ?? true;
                const isLastActive = isChecked && activeCount === 1;

                return (
                  <label
                    key={segment}
                    className={`flex items-center gap-2 ${
                      isLastActive ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isLastActive}
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
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
