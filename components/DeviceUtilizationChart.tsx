"use client";

import { useState, useMemo } from "react";
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
import { useDeviceUtilizationMetrics } from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import { ChartPoint } from "@/lib/analytics/timeseries/timeseriesTypes";
import {
  formatShortDate,
  getNiceTicks,
  getSevenTicks,
} from "@/lib/analytics/utils/helpers";
import { ChartTooltip } from "./charts/ChartsTooltip";
import { LeftAxisLabel, RightAxisLabel } from "./charts/AxisLabel";
import {
  DeviceMetric,
  DeviceUtilizationProps,
  DropdownOption,
} from "@/lib/types/charts";
import { MetricDropdown } from "./charts/MetricDropdown";
import EmptyState from "./emptyStates/emptyStates";
import trendingUpIcon from "../components/icons/trending_up_black.svg";

function computeAvgLength(
  meetings: ChartPoint[],
  duration: ChartPoint[],
): ChartPoint[] {
  const durationMap = new Map(duration.map((d) => [d.date, d.value]));
  return meetings.map((m) => ({
    date: m.date,
    value: m.value ? (durationMap.get(m.date) ?? 0) / m.value : 0,
  }));
}

const METRIC_API_MAP: Record<Exclude<DeviceMetric, "avgLength">, string> = {
  meetings: "ts_meetings_num",
  hours: "ts_meetings_duration_tot",
  connections: "ts_connections_num",
  posts: "ts_posts_num",
};

const PURPLE = "#6860C8";
const PINK = "#D44E80";

export default function DeviceUtilization({
  timeRange,
  selectedDevices,
}: DeviceUtilizationProps) {
  const [metricA, setMetricA] = useState<DeviceMetric>("meetings");
  const [metricB, setMetricB] = useState<DeviceMetric | null>("connections");

  const apiMetricA =
    metricA !== "avgLength"
      ? METRIC_API_MAP[metricA as Exclude<DeviceMetric, "avgLength">]
      : "ts_meetings_num";
  const apiMetricB =
    metricB && metricB !== "avgLength"
      ? METRIC_API_MAP[metricB as Exclude<DeviceMetric, "avgLength">]
      : "ts_meetings_duration_tot";
  const { dataA: rawA, dataB: rawB } = useDeviceUtilizationMetrics(
    apiMetricA,
    apiMetricB,
    timeRange,
    selectedDevices,
  );

  const { dataA: filteredMeetings, dataB: filteredDuration } =
    useDeviceUtilizationMetrics(
      "ts_meetings_num",
      "ts_meetings_duration_tot",
      timeRange,
      selectedDevices,
    );

  const pointsA: ChartPoint[] = useMemo(
    () =>
      metricA === "avgLength"
        ? computeAvgLength(filteredMeetings, filteredDuration)
        : rawA,
    [metricA, rawA, filteredMeetings, filteredDuration],
  );

  const pointsB: ChartPoint[] = useMemo(
    () =>
      metricB === "avgLength"
        ? computeAvgLength(filteredMeetings, filteredDuration)
        : rawB,
    [metricB, rawB, filteredMeetings, filteredDuration],
  );

  const { ticks: ticksA, max: maxA } = getNiceTicks(pointsA);
  const { ticks: ticksB, max: maxB } = getNiceTicks(pointsB);
  const hasTwoMetrics = metricB !== null;
  const baseData = pointsA.length >= pointsB.length ? pointsA : pointsB;

  const deviceData = useMemo(
    () =>
      baseData.map((d, i) => ({
        label: formatShortDate(d.date),
        [metricA]: pointsA[i]?.value ?? 0,
        ...(metricB !== null && { [metricB]: pointsB[i]?.value ?? 0 }),
      })),
    [baseData, metricA, metricB, pointsA, pointsB],
  );

  const xTicks = useMemo(
    () => getSevenTicks(deviceData.map((d) => d.label)),
    [deviceData],
  );

  const handleChangeA = (next: DeviceMetric | null) => {
    if (next === null) return;
    if (next === metricB) setMetricB(metricA);
    setMetricA(next);
  };
  const handleChangeB = (next: DeviceMetric | null) => {
    if (next === metricA) setMetricA(metricB!);
    setMetricB(next);
  };

  const METRIC_LABELS: Record<DeviceMetric, string> = {
    meetings: "Number of meetings",
    hours: "Hours in use",
    connections: "Number of connections",
    posts: "Number of posts",
    avgLength: "Avg. length of meetings",
  };

  const METRIC_OPTIONS: DropdownOption<DeviceMetric>[] = (
    Object.entries(METRIC_LABELS) as [DeviceMetric, string][]
  ).map(([value, label]) => ({ value, label }));

  const isAllZeroData = useMemo(() => {
    return deviceData.every((d) => {
      const valA = d[metricA] ?? 0;
      const valB = metricB ? (d[metricB] ?? 0) : 0;
      return valA === 0 && valB === 0;
    });
  }, [deviceData, metricA, metricB]);

  return (
    <div className="mb-8">
      <div className="font-semibold text-[20px] text-[#090814] mb-0.5">
        Device Utilization
      </div>
      <div className="text-[13px] text-[#8F8F91] mt-2 mb-6">
        Compare up to two types of usage data for devices in your organization
      </div>
      <div className="bg-white rounded-xl py-5 pb-4 border border-gray-200 ">
        {isAllZeroData || deviceData.length === 0 ? (
          <EmptyState
            title="No data for this date range"
            description="Device utilization data appears when meetings occur on your devices"
            icon={trendingUpIcon}
          />
        ) : (
          <ResponsiveContainer width="100%" height={336}>
            <LineChart
              data={deviceData}
              margin={{
                top: 8,
                right: hasTwoMetrics ? 38 : 30,
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
                ticks={xTicks}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                width={30}
                domain={[0, maxA]}
                ticks={ticksA}
                allowDecimals
                tickFormatter={(v: number) =>
                  metricA === "hours"
                    ? `${v % 1 === 0 ? v : v.toFixed(1)}hr`
                    : v % 1 === 0
                      ? `${v}`
                      : `${parseFloat(v.toFixed(2))}`
                }
                label={
                  <LeftAxisLabel
                    label={METRIC_LABELS[metricA]}
                    color="#6860C8"
                  />
                }
              />
              {hasTwoMetrics && (
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
                  tickFormatter={(v: number) =>
                    metricB === "hours"
                      ? `${v % 1 === 0 ? v : v.toFixed(1)}hr`
                      : v % 1 === 0
                        ? `${v}`
                        : `${parseFloat(v.toFixed(2))}`
                  }
                  label={
                    <RightAxisLabel
                      label={METRIC_LABELS[metricB!]}
                      color="#D44E80"
                    />
                  }
                />
              )}
              {ticksA.map((v) => (
                <ReferenceLine
                  key={v}
                  yAxisId="left"
                  y={v}
                  stroke="#f0f0f0"
                  strokeWidth={1}
                />
              ))}
              <Tooltip
                content={
                  <ChartTooltip
                    labelMap={{
                      meetings: "Number of meetings",
                      hours: "Hours in use",
                      connections: "Number of connections",
                      posts: "Number of posts",
                      avgLength: "Avg. length of meetings",
                    }}
                    formatValue={(v, key) =>
                      key === "hours"
                        ? `${v % 1 === 0 ? v : v.toFixed(1)}hr`
                        : v % 1 === 0
                          ? String(v)
                          : String(parseFloat(v.toFixed(2)))
                    }
                  />
                }
              />
              <Line
                yAxisId="left"
                type="linear"
                dataKey={metricA}
                stroke={PURPLE}
                strokeWidth={2}
                dot={{ r: 4, fill: PURPLE, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
              {hasTwoMetrics && (
                <Line
                  yAxisId="right"
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
        )}
        <div className="flex gap-2.5 mt-3.5 flex-wrap items-center px-6.5">
          <MetricDropdown
            value={metricA}
            options={METRIC_OPTIONS}
            color="#6860C8"
            disabledValue={metricB}
            showNone={false}
            onChange={handleChangeA}
          />

          <MetricDropdown
            value={metricB}
            options={METRIC_OPTIONS}
            color="#D44E80"
            disabledValue={metricA}
            showNone={true}
            onChange={handleChangeB}
          />
        </div>
      </div>
    </div>
  );
}
