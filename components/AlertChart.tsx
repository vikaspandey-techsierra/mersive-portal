"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState } from "react";

export interface AlertPoint {
  date: string;
  unreachable: number;
  rebooted: number;
  unassigned: number;
  usbUnplugged: number;
  usbPlugged: number;
  onboarded: number;
  planAssigned: number;
}

interface Props {
  data: AlertPoint[];
  interval: number;
}

const SERIES = [
  { key: "unreachable", label: "Unreachable", color: "#5B5BD6" },
  { key: "rebooted", label: "Rebooted", color: "#C34F7D" },
  { key: "unassigned", label: "Unassigned from template", color: "#5F87C2" },
  { key: "usbUnplugged", label: "USB unplugged", color: "#8B1A00" },
  { key: "usbPlugged", label: "USB plugged in", color: "#8A9B2F" },
  { key: "onboarded", label: "Onboarded", color: "#D47A00" },
  { key: "planAssigned", label: "Plan assigned", color: "#8E56C2" },
];

export default function AlertsChart({ data, interval }: Props) {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(SERIES.map((s) => [s.key, true]))
  );

  const toggle = (key: string) =>
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">Alerts</div>

      <div className="text-[13px] text-gray-400 mb-4">
        Monitor the quantity and which types of alerts occurred in your fleet
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 pb-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid stroke="#E5E7EB" vertical={false} />

            <XAxis
              dataKey="date"
              interval={interval}
              tick={{ fontSize: 12, fill: "#374151" }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis
              tickCount={5}
              tick={{ fontSize: 11, fill: "#000" }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const items = [...payload].reverse();

                return (
                  <div className="bg-white border border-gray-200 rounded-md px-3 py-2 text-sm shadow-md">
                    <div className="font-semibold text-black mb-1">{label}</div>
                    {items
                      .filter((e) => e.value && e.value > 0)
                      .map((e) => (
                        <div key={e.dataKey} style={{ color: e.color }}>
                          {e.name}: {e.value}
                        </div>
                      ))}
                  </div>
                );
              }}
            />

            {SERIES.map(
              (s) =>
                active[s.key] && (
                  <Area
                    key={s.key}
                    type="linear"
                    dataKey={s.key}
                    name={s.label}
                    stackId="1"
                    stroke="none"
                    fill={s.color}
                    fillOpacity={0.95}
                  />
                )
            )}
          </AreaChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap gap-4 mt-6">
          {SERIES.map((s) => (
            <div
              key={s.key}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggle(s.key)}
            >
              <span
                className="w-4 h-4 rounded border-2 flex items-center justify-center"
                style={{
                  borderColor: active[s.key] ? s.color : "#D1D5DB",
                  background: active[s.key] ? s.color : "#fff",
                }}
              >
                {active[s.key] && (
                  <svg width="10" height="8" viewBox="0 0 10 8">
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span
                className="rounded px-3 py-1 text-xs font-medium whitespace-nowrap"
                style={{
                  background: s.color,
                  color: "#fff",
                  opacity: active[s.key] ? 1 : 0.45,
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
