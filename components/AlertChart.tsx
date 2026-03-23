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
import { formatShortDate } from "@/lib/analytics/utils/helpers";

export interface AlertPoint {
  date: string;
  ts_app_alerts_unreachable_num: number;
  ts_app_alerts_rebooted_num: number;
  ts_app_alerts_template_unassigned_num: number;
  ts_app_alerts_usb_out_num: number;
  ts_app_alerts_usb_in_num: number;
  ts_app_alerts_onboarded_num: number;
  ts_app_alerts_plan_assigned_num: number;
}

interface Props {
  data: AlertPoint[];
  interval: number;
}

const SERIES = [
  {
    key: "ts_app_alerts_unreachable_num",
    label: "Unreachable",
    color: "#5B5BD6",
  },
  {
    key: "ts_app_alerts_rebooted_num",
    label: "Rebooted",
    color: "#C34F7D",
  },
  {
    key: "ts_app_alerts_template_unassigned_num",
    label: "Unassigned from template",
    color: "#5F87C2",
  },
  {
    key: "ts_app_alerts_usb_out_num",
    label: "USB unplugged",
    color: "#8B1A00",
  },
  {
    key: "ts_app_alerts_usb_in_num",
    label: "USB plugged in",
    color: "#8A9B2F",
  },
  {
    key: "ts_app_alerts_onboarded_num",
    label: "Onboarded",
    color: "#D47A00",
  },
  {
    key: "ts_app_alerts_plan_assigned_num",
    label: "Plan assigned",
    color: "#8E56C2",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        padding: "12px 14px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
        fontSize: 13,
      }}
    >
      <div
        style={{
          fontWeight: 600,
          marginBottom: 6,
          color: "#111",
        }}
      >
        {label}
      </div>

      {/* VALUES */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => {
        const series = SERIES.find((s) => s.key === p.dataKey);
        return (
          <div
            key={p.dataKey}
            style={{
              color: series?.color,
              fontWeight: 500,
              marginBottom: 2,
            }}
          >
            {series?.label}: {p.value}
          </div>
        );
      })}
    </div>
  );
};

export default function AlertsChart({ data, interval }: Props) {
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(SERIES.map((s) => [s.key, true]))
  );

  const toggle = (key: string) =>
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));

  const formattedData = (data || []).map((d) => ({
    ...d,
    label: formatShortDate(d.date),
  }));

  if (!formattedData.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-black font-semibold">Alerts</div>
        <div className="text-gray-400 text-sm mt-1">No data available</div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">Alerts</div>

      <div className="text-[13px] text-gray-400 mb-4">
        Monitor the quantity and which types of alerts occurred in your fleet
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 pb-4">
        <div className="w-full h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <CartesianGrid stroke="#E5E7EB" vertical={false} />

              <XAxis
                dataKey="label"
                interval={interval}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              {SERIES.map(
                (s) =>
                  active[s.key] && (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.label}
                      stackId="1"
                      stroke={s.color}
                      fill={s.color}
                      fillOpacity={0.85}
                    />
                  )
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

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
                    />
                  </svg>
                )}
              </span>

              <span
                className="rounded px-3 py-1 text-xs font-medium"
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
