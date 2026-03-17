"use client";

import { timeseriesMock } from "@/lib/analytics/mock/timeseriesMock";
import { registerMetric } from "@/lib/analytics/utils/metricsManager";
import { getMetric } from "@/lib/analytics/utils/metricsStore";
import { fetchTimeseriesMetrics } from "@/lib/analytics/timeseries/timeseriesManager";
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

type MetricRow = {
  date: string;
  value: number;
  segment?: string;
};

type ChartRow = {
  label: string;
  [key: string]: string | number;
};

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

//COLORS
const COLOR_PALETTE = [
  "#6860C8",
  "#D44E80",
  "#4D9EC4",
  "#7E9E2E",
  "#E8902A",
];


//TOOLTIP 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
      <div className="font-semibold mb-1 text-black">{label}</div>

      {payload
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((e: any) => e.value > 0)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((e: any) => (
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
}: {
  timeRange?: string;
  title: string;
  subtitle?: string;
}) {
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [metricData, setMetricData] = useState<MetricRow[] | null>(null);
  const [activeSegments, setActiveSegments] = useState<Record<string, boolean>>(
    {}
  );

  // dynamic metrics
  const availableMetrics = useMemo(() => {
    return Array.from(
      new Set(
        timeseriesMock
          .map((row) => row.metric_name)
          .filter((m) => m.includes("_by_"))
      )
    );
  }, []);

  const selected = selectedMetric || availableMetrics[0];

  useEffect(() => {
    if (!selected) return;

    let cancelled = false;

    async function load() {
      const key = `${selected}__${timeRange}`;

      registerMetric(selected);
      await fetchTimeseriesMetrics([selected], timeRange);

      if (cancelled) return;

      const data = getMetric(key);
      if (data) setMetricData(data);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [selected, timeRange]);

  //segments
  const segments = useMemo(() => {
    if (!metricData) return [];
    return Array.from(
      new Set(metricData.map((d) => d.segment).filter(Boolean))
    ) as string[];
  }, [metricData]);

  //colors
  const segmentColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    segments.forEach((s, i) => {
      map[s] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    });
    return map;
  }, [segments]);

  //toggles
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

  //chart data
  const chartData = useMemo(() => {
    if (!metricData || segments.length === 0) return [];

    const map: Record<string, ChartRow> = {};

    metricData.forEach((row) => {
      if (!map[row.date]) {
        map[row.date] = { label: fmtDate(row.date) };

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
      .map(([, value]) => value);
  }, [metricData, segments, activeSegments]);

  return (
    <div className="mb-8 w-full">
      <div className="text-[15px] font-semibold text-black mb-1">
        {title}
      </div>

      <div className="text-[13px] text-gray-400 mb-3">
        {subtitle}
      </div>

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
                const selected = new Set<number>([0, len - 1]);

                for (let i = 1; i < count - 1; i++) {
                  selected.add(Math.round((i / (count - 1)) * (len - 1)));
                }

                return [...selected]
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
            {availableMetrics.map((m) => (
              <option key={m} value={m}>
                {m.split("_by_")[1]?.toUpperCase()}
              </option>
            ))}
          </select>

          {/* legend */}
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
