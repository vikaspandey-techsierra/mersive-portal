"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Check } from "lucide-react";
import { ChartPoint } from "@/lib/analytics/timeseries/timeseriesTypes";
import { formatShortDate } from "@/lib/analytics/utils/helpers";
import { useFilteredDeviceUtilizationMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";

interface DeviceUtilizationProps {
  timeRange: string;
  selectedDeviceNames?: string[];
}

type DeviceMetric =
  | "meetings"
  | "hours"
  | "connections"
  | "posts"
  | "avgLength";

const METRIC_LABELS: Record<DeviceMetric, string> = {
  meetings: "Number of meetings",
  hours: "Hours in use",
  connections: "Number of connections",
  posts: "Number of posts",
  avgLength: "Avg. length of meetings",
};

const METRIC_KEYS = Object.keys(METRIC_LABELS) as DeviceMetric[];

const METRIC_API_MAP: Record<DeviceMetric, string> = {
  meetings: "ts_meetings_num",
  hours: "ts_meetings_duration_tot",
  connections: "ts_connections_num",
  posts: "ts_posts_num",
  avgLength: "", // handled separately via avgLength logic
};

const PURPLE = "#6860C8";
const PINK = "#D44E80";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

function computeAvgLength(
  meetings: ChartPoint[],
  duration: ChartPoint[],
): ChartPoint[] {
  const durMap = new Map(duration.map((d) => [d.date, d.value]));
  return meetings.map((m) => ({
    date: m.date,
    value: m.value > 0 ? (durMap.get(m.date) ?? 0) / m.value : 0,
  }));
}

function getNiceTicks(points: ChartPoint[]): { ticks: number[]; max: number } {
  if (!points.length) return { ticks: [0, 3, 6, 9, 12], max: 12 };
  const rawMax = Math.max(...points.map((p) => p.value));
  if (rawMax === 0) return { ticks: [0, 1, 2, 3, 4], max: 4 };
  const roughStep = rawMax / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const candidates = [1, 2, 2.5, 5, 10].map((c) => c * magnitude);
  const niceStep =
    candidates.find((c) => c >= roughStep) ?? candidates[candidates.length - 1];
  const niceMax = niceStep * 4;
  const ticks = [0, 1, 2, 3, 4].map(
    (i) => Math.round(niceStep * i * 1e10) / 1e10,
  );
  return { ticks, max: niceMax };
}

/* ─────────────────────────────────────────────
   AXIS LABELS
───────────────────────────────────────────── */

const LeftAxisLabel = ({
  viewBox,
  label,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
  label: string;
}) => {
  if (!viewBox) return null;
  const cx = viewBox.x - 1;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={PURPLE}
      fontSize={16}
      fontWeight={500}
      textAnchor="middle"
      transform={`rotate(-90, ${cx}, ${cy})`}
    >
      {label}
    </text>
  );
};

const RightAxisLabel = ({
  viewBox,
  label,
}: {
  viewBox?: { x: number; y: number; width: number; height: number };
  label: string;
}) => {
  if (!viewBox) return null;
  const cx = viewBox.x + viewBox.width + 10;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={PINK}
      fontSize={16}
      fontWeight={500}
      textAnchor="middle"
      transform={`rotate(90, ${cx}, ${cy})`}
    >
      {label}
    </text>
  );
};

/* ─────────────────────────────────────────────
   METRIC DROPDOWN
───────────────────────────────────────────── */

const MetricDropdown = ({
  value,
  color,
  disabledOption,
  showNone,
  onChange,
}: {
  value: DeviceMetric | null;
  color: string;
  disabledOption: DeviceMetric | null;
  showNone?: boolean;
  onChange: (v: DeviceMetric | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-white text-[13px] font-medium rounded-md px-4 py-1.5 whitespace-nowrap"
        style={{ background: color }}
      >
        {value ? METRIC_LABELS[value] : "None"}
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M2 4l4 4 4-4"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg min-w-55 z-999 py-1.5">
          {showNone && (
            <div
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className={`flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition ${
                value === null
                  ? "text-black font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>None</span>
              {value === null && (
                <Check size={16} strokeWidth={2.5} className="text-[#6860C8]" />
              )}
            </div>
          )}
          {METRIC_KEYS.map((key) => {
            const isSelected = value === key;
            const isDisabled = key === disabledOption;
            return (
              <div
                key={key}
                onClick={() => {
                  if (!isDisabled) {
                    onChange(key);
                    setOpen(false);
                  }
                }}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition ${
                  isDisabled
                    ? "text-gray-400 cursor-default"
                    : "cursor-pointer hover:bg-gray-100 text-gray-800"
                } ${isSelected ? "font-medium" : ""}`}
              >
                <span>{METRIC_LABELS[key]}</span>
                {isSelected && (
                  <Check
                    size={16}
                    strokeWidth={2.5}
                    className="text-[#6860C8]"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function DeviceUtilization({
  timeRange,
  selectedDeviceNames = [],
}: DeviceUtilizationProps) {
  const [metricA, setMetricA] = useState<DeviceMetric>("meetings");
  const [metricB, setMetricB] = useState<DeviceMetric | null>("connections");

  // Primary metrics A & B — device-filtered
  const { dataA: rawA, dataB: rawB } = useFilteredDeviceUtilizationMetrics(
    metricA !== "avgLength" ? METRIC_API_MAP[metricA] : "",
    metricB && metricB !== "avgLength" ? METRIC_API_MAP[metricB] : "",
    timeRange,
    selectedDeviceNames,
  );

  // avgLength needs meetings + duration_tot filtered the same way
  const { dataA: meetingsData, dataB: durationData } =
    useFilteredDeviceUtilizationMetrics(
      "ts_meetings_num",
      "ts_meetings_duration_tot",
      timeRange,
      selectedDeviceNames,
    );

  const avgLengthData = useMemo(
    () => computeAvgLength(meetingsData, durationData),
    [meetingsData, durationData],
  );

  const pointsA: ChartPoint[] = metricA === "avgLength" ? avgLengthData : rawA;
  const pointsB: ChartPoint[] = metricB === "avgLength" ? avgLengthData : rawB;

  const hasMetricAData = pointsA.some((p) => p.value > 0);
  const hasMetricBData = metricB !== null && pointsB.some((p) => p.value > 0);

  const { ticks: ticksA, max: maxA } = getNiceTicks(pointsA);
  const { ticks: ticksB, max: maxB } = getNiceTicks(pointsB);

  const leftTicks = hasMetricAData ? ticksA : ticksB;
  const leftMax = hasMetricAData ? maxA : maxB;
  const baseData = hasMetricAData ? pointsA : pointsB;

  const deviceData = baseData.map((d, i) => ({
    label: formatShortDate(d.date),
    ...(hasMetricAData && { [metricA]: pointsA[i]?.value ?? null }),
    ...(metricB && hasMetricBData && { [metricB]: pointsB[i]?.value ?? null }),
  }));

  const hasTwoMetrics = metricB !== null;
  const showRightAxis = hasTwoMetrics && hasMetricBData;
  const metricBAxisId = showRightAxis ? "right" : "left";
  const refLineAxisId = hasMetricAData ? "left" : "right";
  const refLineTicks = hasMetricAData ? leftTicks : ticksB;

  const handleChangeA = (next: DeviceMetric | null) => {
    if (next === null) return;
    if (next === metricB) setMetricB(metricA);
    setMetricA(next);
  };
  const handleChangeB = (next: DeviceMetric | null) => {
    if (next === metricA) setMetricA(metricB!);
    setMetricB(next);
  };

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">
        Device Utilization
      </div>
      <div className="text-[13px] text-gray-400 mb-3">
        Compare up to two types of usage data for devices in your organization
      </div>

      <div className="bg-white rounded-xl py-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={deviceData}
            margin={{
              top: 8,
              right: showRightAxis ? 38 : 30,
              left: 24,
              bottom: 0,
            }}
          >
            <CartesianGrid
              stroke="#f0f0f0"
              vertical={false}
              horizontal={false}
            />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              axisLine={{ stroke: "#f0f0f0" }}
              tickLine={false}
              ticks={(() => {
                const len = deviceData.length;
                if (len === 0) return [];
                const count = 7;
                const sel = new Set<number>([0, len - 1]);
                for (let i = 1; i < count - 1; i++)
                  sel.add(Math.round((i / (count - 1)) * (len - 1)));
                return [...sel]
                  .sort((a, b) => a - b)
                  .map((i) => deviceData[i].label);
              })()}
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={30}
              domain={[0, leftMax]}
              ticks={leftTicks}
              allowDecimals
              tickFormatter={(v: number) => {
                const m = hasMetricAData ? metricA : metricB!;
                if (m === "hours") return `${v % 1 === 0 ? v : v.toFixed(1)}hr`;
                return v % 1 === 0 ? `${v}` : `${parseFloat(v.toFixed(2))}`;
              }}
              label={<LeftAxisLabel label={METRIC_LABELS[metricA]} />}
            />

            {showRightAxis && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={30}
                domain={[0, maxB]}
                ticks={ticksB}
                allowDecimals
                tickFormatter={(v: number) => {
                  if (metricB === "hours")
                    return `${v % 1 === 0 ? v : v.toFixed(1)}hr`;
                  return v % 1 === 0 ? `${v}` : `${parseFloat(v.toFixed(2))}`;
                }}
                label={<RightAxisLabel label={METRIC_LABELS[metricB!]} />}
              />
            )}

            {refLineTicks.map((v) => (
              <ReferenceLine
                key={v}
                yAxisId={refLineAxisId}
                y={v}
                stroke="#f0f0f0"
                strokeWidth={1}
              />
            ))}

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
                    <div className="font-semibold mb-1 text-black">{label}</div>
                    {payload
                      .filter((e) => (e.value as number) > 0)
                      .map((e) => (
                        <div
                          key={e.name as string}
                          className="mt-1"
                          style={{ color: e.color }}
                        >
                          {e.name}: {e.value}
                        </div>
                      ))}
                  </div>
                );
              }}
            />

            {hasMetricAData && (
              <Line
                yAxisId="left"
                type="linear"
                dataKey={metricA}
                stroke={PURPLE}
                strokeWidth={2}
                dot={{ r: 4, fill: PURPLE, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            )}
            {hasTwoMetrics && hasMetricBData && (
              <Line
                yAxisId={metricBAxisId}
                type="linear"
                dataKey={metricB!}
                stroke={PINK}
                strokeWidth={2}
                dot={{ r: 4, fill: PINK, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>

        <div className="flex gap-2.5 mt-3.5 flex-wrap items-center px-6.5">
          <MetricDropdown
            value={metricA}
            color={PURPLE}
            disabledOption={metricB}
            showNone={false}
            onChange={handleChangeA}
          />
          <MetricDropdown
            value={metricB}
            color={PINK}
            disabledOption={metricA}
            showNone
            onChange={handleChangeB}
          />
        </div>
      </div>
    </div>
  );
}
