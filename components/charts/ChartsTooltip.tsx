"use client";

import { ChartTooltipProps } from "@/lib/types/charts";

export function ChartTooltip({
  active,
  payload,
  label,
  labelMap,
  formatValue,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[13px] shadow-md min-w-30">
      <div className="font-semibold mb-1 text-black">{label}</div>

      {payload.map((entry) => {
        const key = entry.dataKey;

        const displayLabel = (labelMap && labelMap[key]) ?? entry.name ?? key;

        const colour = entry.color ?? entry.stroke ?? entry.fill ?? "#000";

        const displayValue = formatValue
          ? formatValue(entry.value ?? 0, key)
          : String(entry.value ?? 0);

        return (
          <div key={key} className="mt-1" style={{ color: colour }}>
            {displayLabel}: {displayValue}
          </div>
        );
      })}
    </div>
  );
}
