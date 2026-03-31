"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { formatShortDate, getSevenTicks } from "@/lib/analytics/utils/helpers";
import { useDowntimeChart } from "@/lib/analytics/hooks/useTimeSeriesMetrics";
import { ChartTooltip } from "./charts/ChartsTooltip";
import { LeftAxisLabel, RightAxisLabel } from "./charts/AxisLabel";
import { DowntimeChartProps } from "@/lib/types/charts";
import EmptyState from "./emptyStates/emptyStates";
import scheduleBlackIcon from "../components/icons/schedule_black.svg";

const PURPLE = "#5E54C5";
const PINK = "#C55483";

export default function DowntimeChart({
  timeRange,
  selectedDevices,
}: DowntimeChartProps) {
  const { data: rawData } = useDowntimeChart(timeRange, selectedDevices);

  const formattedData = useMemo(
    () => rawData.map((d) => ({ ...d, label: formatShortDate(d.date) })),
    [rawData],
  );

  const deviceTicks = [0, 6, 12, 18, 24];

  const xTicks = useMemo(
    () => getSevenTicks(formattedData.map((d) => d.label)),
    [formattedData],
  );

  const maxHours = useMemo(
    () =>
      formattedData.length > 0
        ? Math.max(...formattedData.map((d) => d.hours), 1)
        : 1,
    [formattedData],
  );
  const hourTicks = [0, 0.25, 0.5, 0.75, 1].map((f) =>
    Number((maxHours * f).toFixed(1)),
  );

  console.log("formattedData --->", formattedData);

  const isAllZeroData = useMemo(() => {
    return formattedData.every(
      (d) => (d.devices ?? 0) === 0 && (d.hours ?? 0) === 0,
    );
  }, [formattedData]);

  return (
    <div className="mb-8">
      <div className="font-semibold text-[20px] text-[#090814] mb-0.5">
        Downtime
      </div>
      <div className="text-[13px] text-[#8F8F91] mt-2 mb-6">
        Monitor how many devices are down and for long the downtime lasted
      </div>

      <div className="bg-white rounded-xl py-5 pb-4 border border-gray-200">
        <div>
          {isAllZeroData || formattedData.length === 0 ? (
            <EmptyState
              title="No data for this date range"
              description="Downtime data appears when devices experience connectivity interruptions"
              icon={scheduleBlackIcon}
            />
          ) : (
            <ResponsiveContainer width="100%" height={336}>
              <LineChart
                data={formattedData}
                margin={{ top: 10, right: 68, left: 52, bottom: 4 }}
              >
                <XAxis
                  dataKey="label"
                  ticks={xTicks}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  domain={[0, 24]}
                  ticks={deviceTicks}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                  label={
                    <LeftAxisLabel
                      label="Number of devices"
                      color="#5E54C5"
                      offset={34} // matches the original cx = viewBox.x - 34
                    />
                  }
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, maxHours]}
                  ticks={hourTicks}
                  tickFormatter={(v: number) => `${v.toFixed(1)} hr`}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  label={
                    <RightAxisLabel
                      label="Number of hours"
                      color="#C55483"
                      offset={44} // matches the original cx = viewBox.x + viewBox.width + 44
                    />
                  }
                />
                {deviceTicks.map((tick) => (
                  <ReferenceLine
                    key={tick}
                    yAxisId="left"
                    y={tick}
                    stroke="#E5E7EB"
                    strokeWidth={1}
                  />
                ))}
                <Tooltip
                  content={
                    <ChartTooltip
                      labelMap={{
                        devices: "Devices",
                        hours: "Hours",
                      }}
                      formatValue={(v, key) =>
                        key === "hours"
                          ? `${Number(v).toFixed(1)} hr`
                          : String(v)
                      }
                    />
                  }
                />
                <Line
                  yAxisId="left"
                  type="linear"
                  dataKey="devices"
                  stroke={PURPLE}
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: PURPLE, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: PURPLE }}
                  isAnimationActive={false}
                />
                <Line
                  yAxisId="right"
                  type="linear"
                  dataKey="hours"
                  stroke={PINK}
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: PINK, strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: PINK }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex gap-2.5 px-6  mt-8 mb-1">
          <span
            className="inline-flex items-center text-white text-sm font-medium rounded-full px-4 py-1.5"
            style={{ background: PURPLE }}
          >
            Number of devices
          </span>
          <span
            className="inline-flex items-center text-white text-sm font-medium rounded-full px-4 py-1.5"
            style={{ background: PINK }}
          >
            Number of hours
          </span>
        </div>
      </div>
    </div>
  );
}
