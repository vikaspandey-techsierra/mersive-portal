"use client";

/**
 * AlertChart.tsx
 *
 * Stacked area chart for the Monitoring > Alerts section.
 *
 * Data fields (canonical names from analytics.ts):
 *   ts_app_alerts_unreachable_num
 *   ts_app_alerts_rebooted_num
 *   ts_app_alerts_template_unassigned_num
 *   ts_app_alerts_usb_in_num
 *   ts_app_alerts_usb_out_num
 *   ts_app_alerts_onboarded_num
 *   ts_app_alerts_plan_assigned_num
 */

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertPoint } from "@/lib/analytics";

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Alert series definition ──────────────────────────────────────────────────
// key = canonical metric name from AlertPoint

interface AlertSeries {
  key: keyof Omit<AlertPoint, "date">;
  label: string;
  color: string;
}

const ALERT_SERIES: AlertSeries[] = [
  {
    key: "ts_app_alerts_unreachable_num",
    label: "Unreachable",
    color: "#6860C8",
  },
  { key: "ts_app_alerts_rebooted_num", label: "Rebooted", color: "#D44E80" },
  {
    key: "ts_app_alerts_template_unassigned_num",
    label: "Unassigned from template",
    color: "#4D9EC4",
  },
  {
    key: "ts_app_alerts_usb_out_num",
    label: "USB unplugged",
    color: "#E07B42",
  },
  {
    key: "ts_app_alerts_usb_in_num",
    label: "USB plugged in",
    color: "#7E9E2E",
  },
  { key: "ts_app_alerts_onboarded_num", label: "Onboarded", color: "#9B6DCC" },
  {
    key: "ts_app_alerts_plan_assigned_num",
    label: "Plan assigned",
    color: "#C4913A",
  },
];

// ─── Tooltip ─────────────────────────────────────────────────────────────────

interface TEntry {
  name: string;
  value: number;
  color: string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TEntry[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  const items = [...payload].reverse();
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md">
      <div className="font-semibold mb-1 text-gray-800">{label}</div>
      {items
        .filter((e) => e.value > 0)
        .map((e) => (
          <div key={e.name} className="mt-1" style={{ color: e.color }}>
            {e.name}: {e.value}
          </div>
        ))}
    </div>
  );
};

// ─── Toggle pill ──────────────────────────────────────────────────────────────

const SeriesToggle = ({
  series,
  checked,
  onToggle,
}: {
  series: AlertSeries;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div
    className="inline-flex items-center gap-1.5 cursor-pointer select-none"
    onClick={onToggle}
  >
    <span
      className="w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all shrink-0"
      style={
        checked
          ? { borderColor: series.color, background: series.color }
          : { borderColor: "#D1D5DB", background: "#fff" }
      }
    >
      {checked && (
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
      className="rounded px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-opacity"
      style={{
        background: series.color,
        color: "#fff",
        opacity: checked ? 1 : 0.4,
      }}
    >
      {series.label}
    </span>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

interface AlertsChartProps {
  data: AlertPoint[];
  interval: number;
}

export default function AlertsChart({ data, interval }: AlertsChartProps) {
  // All series enabled by default
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ALERT_SERIES.map((s) => [s.key, true])),
  );

  const toggle = (key: string) =>
    setActiveKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  // Map raw AlertPoint (canonical keys) → chart rows
  const chartData = data.map((d) => {
    const row: Record<string, string | number> = { label: fmtDate(d.date) };
    ALERT_SERIES.forEach((s) => {
      row[s.key] = activeKeys[s.key] ? (d[s.key] ?? 0) : 0;
    });
    return row;
  });

  return (
    <div className="mb-8">
      <div className="font-semibold text-[15px] text-black mb-0.5">Alerts</div>
      <div className="text-[13px] text-gray-400 mb-3">
        Monitor the quantity and which types of alerts occurred in your fleet
      </div>

      <div className="bg-white rounded-xl p-5 pb-4 border border-gray-200">
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 16, left: -20, bottom: 0 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#000" }}
              interval={interval}
              axisLine={false}
              tickLine={false}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ChartTooltip />} />

            {ALERT_SERIES.map((s) => (
              <Area
                key={s.key}
                type="linear"
                dataKey={s.key}
                name={s.label}
                stackId="alerts"
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.85}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>

        {/* Series toggles */}
        <div className="flex items-center gap-3 mt-3.5 flex-wrap">
          {ALERT_SERIES.map((s) => (
            <SeriesToggle
              key={s.key}
              series={s}
              checked={activeKeys[s.key]}
              onToggle={() => toggle(s.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
