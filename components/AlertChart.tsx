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
import { useState, useMemo, useEffect } from "react";
import { formatShortDate, getSevenTicks } from "@/lib/analytics/utils/helpers";
import { useFilteredAlertsPoints } from "@/lib/analytics/hooks/useTimeSeriesMetrics";

interface Props {
  timeRange: string;
  selectedDevices: Set<string>;
  interval?: number;
}

const SERIES_CONFIG: Record<string, { label: string; color: string }> = {
  ts_app_alerts_unreachable_num: { label: "Unreachable", color: "#5B5BD6" },
  ts_app_alerts_rebooted_num: { label: "Rebooted", color: "#C34F7D" },
  ts_app_alerts_template_unassigned_num: {
    label: "Unassigned from template",
    color: "#5F87C2",
  },
  ts_app_alerts_usb_out_num: { label: "USB unplugged", color: "#8B1A00" },
  ts_app_alerts_usb_in_num: { label: "USB plugged in", color: "#8A9B2F" },
  ts_app_alerts_onboarded_num: { label: "Onboarded", color: "#D47A00" },
  ts_app_alerts_plan_assigned_num: { label: "Plan assigned", color: "#8E56C2" },
};

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
      <div style={{ fontWeight: 600, marginBottom: 6, color: "#111" }}>
        {label}
      </div>
      {/* Show all series including zero values */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => {
        const config = SERIES_CONFIG[p.dataKey];
        return (
          <div
            key={p.dataKey}
            style={{ color: config?.color, fontWeight: 500, marginBottom: 2 }}
          >
            {config?.label ?? p.dataKey}: {p.value}
          </div>
        );
      })}
    </div>
  );
};

export default function AlertsChart({ timeRange, selectedDevices }: Props) {
  const rawData = useFilteredAlertsPoints(timeRange, selectedDevices);

  const formattedData = useMemo(
    () => rawData.map((d) => ({ ...d, label: formatShortDate(d.date) })),
    [rawData],
  );

  const availableSeries = useMemo(() => {
    if (!formattedData.length) return [];
    const allKeys = new Set<string>();
    formattedData.forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (k.startsWith("ts_app_alerts_")) allKeys.add(k);
      });
    });
    return Array.from(allKeys);
  }, [formattedData]);

  const [active, setActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive((prev) => {
      const next: Record<string, boolean> = {};
      availableSeries.forEach((key) => {
        next[key] = prev[key] ?? true;
      });
      return next;
    });
  }, [availableSeries]);

  // Always exactly 7 X-axis labels
  const xTicks = useMemo(
    () => getSevenTicks(formattedData.map((d) => d.label as string)),
    [formattedData],
  );

  const toggle = (key: string) => {
    const activeCount = Object.values(active).filter(Boolean).length;
    if (active[key] && activeCount === 1) return;
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!formattedData.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-black font-semibold">Alerts</div>
        <div className="text-gray-400 text-sm mt-1">No data available</div>
      </div>
    );
  }

  const activeCount = Object.values(active).filter(Boolean).length;

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
                ticks={xTicks}
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
              {/* Always render active areas — they sit at y=0 when no data */}
              {availableSeries.map((key) => {
                if (!active[key]) return null;
                const config = SERIES_CONFIG[key];
                const color = config?.color ?? "#94A3B8";
                return (
                  <Area
                    key={key}
                    type="linear"
                    dataKey={key}
                    name={config?.label ?? key}
                    stackId="1"
                    stroke={color}
                    fill={color}
                    fillOpacity={0.85}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-4 mt-6">
          {availableSeries.map((key) => {
            const config = SERIES_CONFIG[key];
            const color = config?.color ?? "#94A3B8";
            const label = config?.label ?? key;
            const isLastActive = active[key] && activeCount === 1;
            return (
              <div
                key={key}
                className={`flex items-center gap-2 ${isLastActive ? "cursor-not-allowed" : "cursor-pointer"}`}
                onClick={() => toggle(key)}
              >
                <span
                  className="w-4 h-4 rounded border-2 flex items-center justify-center"
                  style={{
                    borderColor: active[key] ? color : "#D1D5DB",
                    background: active[key] ? color : "#fff",
                    opacity: isLastActive ? 0.6 : 1,
                  }}
                >
                  {active[key] && (
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
                    background: color,
                    color: "#fff",
                    opacity: active[key] ? (isLastActive ? 0.6 : 1) : 0.45,
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
