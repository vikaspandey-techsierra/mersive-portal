"use client";

import { AxisLabelProps } from "@/lib/types/charts";

export function LeftAxisLabel({
  viewBox,
  label,
  color = "#6860C8",
  offset = 0,
}: AxisLabelProps) {
  if (!viewBox) return null;
  const cx = viewBox.x - 1 - offset;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={color}
      fontSize={16}
      fontWeight={500}
      textAnchor="middle"
      transform={`rotate(-90, ${cx}, ${cy})`}
    >
      {label}
    </text>
  );
}

export function RightAxisLabel({
  viewBox,
  label,
  color = "#D44E80",
  offset = 10,
}: AxisLabelProps) {
  if (!viewBox) return null;
  const cx = viewBox.x + viewBox.width + offset;
  const cy = viewBox.y + viewBox.height / 2;
  return (
    <text
      x={cx}
      y={cy}
      fill={color}
      fontSize={16}
      fontWeight={500}
      textAnchor="middle"
      transform={`rotate(90, ${cx}, ${cy})`}
    >
      {label}
    </text>
  );
}
