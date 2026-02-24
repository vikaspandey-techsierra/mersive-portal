"use client";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  REUSABLE COMPONENT LIBRARY
 *  File: components/ui/index.tsx
 *
 *  Components exported:
 *    1. StatCard          — metric tile with purple icon box
 *    2. SectionPanel      — collapsible section wrapper
 *    3. FaqAccordion      — expandable FAQ list
 *    4. ReleaseNotes      — version changelog card
 *    5. CheckPill         — checkbox + colored pill toggle
 *    6. TimeRangeBar      — Last 7d / 30d / 60d / 90d / All time selector
 *    7. ChartTooltip      — dark tooltip for recharts
 *    8. StackedAreaChart  — stacked area chart (stacking-bug-fixed)
 *    9. LineUsageChart    — dual-line chart for device utilization
 *
 *  Usage example at the bottom of this file.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ════════════════════════════════════════════════════════════════════════════
//  SHARED TYPES
// ════════════════════════════════════════════════════════════════════════════

export interface SeriesItem {
  key: string;
  label: string;
  color: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ReleaseNote {
  version: string;
  date: string;
  bulletPoints: string[];
  releaseNotesUrl: string;
}

// ════════════════════════════════════════════════════════════════════════════
//  1. STAT CARD
//  A metric tile with a purple icon, label, and bold value.
//
//  Props:
//    icon     — any ReactNode (SVG, emoji, etc.)
//    label    — small gray label text
//    value    — large bold value string
//    isLast   — if true, removes the right border divider
//
//  Usage:
//    <StatCard icon={<IconMonitor />} label="Meetings underway" value="0" />
//    <StatCard icon={<IconUser />}    label="Unique users"      value="11" isLast />
// ════════════════════════════════════════════════════════════════════════════

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
}

export function StatCard({
  icon,
  label,
  value,
  isLast = false,
}: StatCardProps) {
  return (
    <div
      style={{
        flex: "1 1 0",
        minWidth: 0,
        padding: "20px 24px 26px",
        borderRight: isLast ? "none" : "1px solid #e8e8e8",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: "#6860C8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 14,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          margin: "0 0 5px",
          fontSize: 13,
          color: "#888",
          fontWeight: 400,
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 700,
          color: "#111",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  StatCardRow — wraps multiple StatCards in the bordered row layout
//
//  Usage:
//    <StatCardRow>
//      <StatCard ... />
//      <StatCard ... isLast />
//    </StatCardRow>
// ────────────────────────────────────────────────────────────────────────────

export function StatCardRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        borderTop: "1px solid #e8e8e8",
        borderBottom: "1px solid #e8e8e8",
      }}
    >
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  2. SECTION PANEL
//  A collapsible section with a title and chevron toggle.
//
//  Props:
//    title        — section heading text
//    defaultOpen  — whether expanded by default (default: true)
//    children     — content shown when expanded
//
//  Usage:
//    <SectionPanel title="Updates">
//      <p>content here</p>
//    </SectionPanel>
// ════════════════════════════════════════════════════════════════════════════

export interface SectionPanelProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionPanel({
  title,
  defaultOpen = true,
  children,
}: SectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 24px 18px",
          borderBottom: open ? "none" : "1px solid #e8e8e8",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111" }}>
          {title}
        </h2>
        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#666",
            padding: 4,
            display: "flex",
          }}
        >
          {open ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  3. FAQ ACCORDION
//  A list of expandable question/answer rows.
//
//  Props:
//    items  — array of { id, question, answer }
//
//  Usage:
//    <FaqAccordion items={[
//      { id: "1", question: "How do I activate?", answer: "Go to Settings..." },
//    ]} />
// ════════════════════════════════════════════════════════════════════════════

function FaqRow({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #f0f0f0" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{ fontSize: 13.5, color: "#222", fontWeight: 400, flex: 1 }}
        >
          {item.question}
        </span>
        <span
          style={{
            width: 22,
            height: 22,
            flexShrink: 0,
            marginLeft: 16,
            border: "1.5px solid #ccc",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: 17,
            fontWeight: 300,
            transition: "all 0.15s",
          }}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <p
          style={{
            margin: "0 0 13px",
            fontSize: 13,
            color: "#666",
            lineHeight: 1.65,
            paddingRight: 38,
          }}
        >
          {item.answer}
        </p>
      )}
    </div>
  );
}

export interface FaqAccordionProps {
  items: FaqItem[];
  title?: string; // optional card header label
  showHeader?: boolean; // default true
}

export function FaqAccordion({
  items,
  title = "Frequently Asked Questions",
  showHeader = true,
}: FaqAccordionProps) {
  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 12,
        padding: "20px 22px",
      }}
    >
      {showHeader && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              background: "#f4f4f4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#555"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
            {title}
          </span>
        </div>
      )}
      {items.map((faq) => (
        <FaqRow key={faq.id} item={faq} />
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  4. RELEASE NOTES CARD
//  Displays the latest version, date, bullet points, and a link.
//
//  Props:
//    release  — ReleaseNote object
//
//  Usage:
//    <ReleaseNotesCard release={latestRelease} />
// ════════════════════════════════════════════════════════════════════════════

export interface ReleaseNotesCardProps {
  release: ReleaseNote;
  title?: string;
}

export function ReleaseNotesCard({
  release,
  title = "Latest Updates",
}: ReleaseNotesCardProps) {
  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 12,
        padding: "20px 22px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "#f4f4f4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#555"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
          {title}
        </span>
      </div>

      <p
        style={{
          margin: "0 0 2px",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#111",
        }}
      >
        {release.version}
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#b0b0b0" }}>
        {release.date}
      </p>

      <ul style={{ margin: "0 0 18px", paddingLeft: 20 }}>
        {release.bulletPoints.map((bp, i) => (
          <li
            key={i}
            style={{
              fontSize: 13,
              color: "#444",
              marginBottom: 4,
              lineHeight: 1.5,
            }}
          >
            {bp}
          </li>
        ))}
      </ul>

      <a
        href={release.releaseNotesUrl}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 13,
          color: "#6860C8",
          fontWeight: 500,
          textDecoration: "none",
        }}
      >
        See all release notes
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  5. CHECK PILL
//  A checkbox + colored pill label toggle used in chart legends.
//
//  Props:
//    item      — { key, label, color }
//    checked   — boolean state
//    onToggle  — toggle callback
//
//  Usage:
//    <CheckPill item={{ key:"web", label:"Web", color:"#6860C8" }}
//               checked={active.web} onToggle={() => toggle("web")} />
// ════════════════════════════════════════════════════════════════════════════

export interface CheckPillProps {
  item: SeriesItem;
  checked: boolean;
  onToggle: () => void;
}

export function CheckPill({ item, checked, onToggle }: CheckPillProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        opacity: checked ? 1 : 0.35,
        transition: "opacity 0.2s",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: `2px solid ${checked ? "#6860C8" : "#ccc"}`,
          backgroundColor: checked ? "#6860C8" : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        style={{
          backgroundColor: item.color,
          color: "#fff",
          fontSize: 12,
          fontWeight: 600,
          padding: "3px 11px",
          borderRadius: 999,
          userSelect: "none",
        }}
      >
        {item.label}
      </span>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  6. TIME RANGE BAR
//  A row of buttons for selecting a time range.
//
//  Props:
//    options   — array of { key, label }
//    value     — currently active key
//    onChange  — callback when a new range is selected
//
//  Usage:
//    const [range, setRange] = useState("7d");
//    <TimeRangeBar
//      options={[{ key:"7d", label:"Last 7 days" }, { key:"30d", label:"Last 30 days" }]}
//      value={range}
//      onChange={setRange}
//    />
// ════════════════════════════════════════════════════════════════════════════

export interface TimeRangeOption {
  key: string;
  label: string;
}

export interface TimeRangeBarProps {
  options: TimeRangeOption[];
  value: string;
  onChange: (key: string) => void;
}

export function TimeRangeBar({ options, value, onChange }: TimeRangeBarProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            border: "1px solid",
            borderRadius: 8,
            padding: "7px 14px",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
            background: value === key ? "#6860C8" : "#fff",
            color: value === key ? "#fff" : "#333",
            borderColor: value === key ? "#6860C8" : "#d0d0d0",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  7. CHART TOOLTIP
//  Dark tooltip used inside Recharts charts.
//  Pass directly to <Tooltip content={<ChartTooltip />} />
//
//  Props:
//    flipOrder  — reverse the series list (useful for stacked charts so
//                 the top layer appears first in the tooltip)
// ════════════════════════════════════════════════════════════════════════════

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  flipOrder?: boolean;
}

export function ChartTooltip({
  active,
  payload,
  label,
  flipOrder = false,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const items = flipOrder ? [...payload].reverse() : payload;
  return (
    <div
      style={{
        background: "#1a1a2e",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        minWidth: 160,
      }}
    >
      <p style={{ color: "#aaa", margin: "0 0 7px", fontWeight: 600 }}>
        {label}
      </p>
      {items
        .filter((e) => e.value > 0)
        .map((e) => (
          <div
            key={e.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: e.color,
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span style={{ color: "#ccc" }}>{e.name}:</span>
            <span
              style={{
                color: "#fff",
                fontWeight: 600,
                marginLeft: "auto",
                paddingLeft: 8,
              }}
            >
              {e.value}
            </span>
          </div>
        ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  8. STACKED AREA CHART  (stacking-order-bug-fixed version)
//
//  BUG FIX NOTE:
//  Never conditionally mount/unmount <Area> components — it resets Recharts'
//  internal stack order. Instead, pass `activeKeys` and this component zeros
//  out hidden series values in the data transform.
//
//  Props:
//    data        — array of data objects (must contain all series keys + dateLabel)
//    series      — array of SeriesItem in BOTTOM-TO-TOP stack order
//    activeKeys  — Record<seriesKey, boolean> — which series are visible
//    height      — chart height in px (default 300)
//    yTicks      — Y-axis tick values (default [0,6,12,18,24])
//    yDomain     — Y-axis domain (default [0,24])
//    xInterval   — X-axis tick interval (default 0)
//
//  Usage:
//    <StackedAreaChart
//      data={connectionData}
//      series={PROTOCOL_SERIES}
//      activeKeys={activeKeys}
//    />
// ════════════════════════════════════════════════════════════════════════════

export interface StackedAreaChartProps {
  data: Record<string, string | number>[];
  series: SeriesItem[]; // bottom-to-top order
  activeKeys: Record<string, boolean>;
  height?: number;
  yTicks?: number[];
  yDomain?: [number, number];
  xInterval?: number;
  xDataKey?: string;
}

export function StackedAreaChart({
  data,
  series,
  activeKeys,
  height = 300,
  yTicks = [0, 6, 12, 18, 24],
  yDomain = [0, 24],
  xInterval = 0,
  xDataKey = "label",
}: StackedAreaChartProps) {
  // Zero out hidden series instead of conditionally removing <Area> components
  const chartData = data.map((point) => {
    const p: Record<string, string | number> = { [xDataKey]: point[xDataKey] };
    series.forEach((s) => {
      p[s.key] = activeKeys[s.key] ? (point[s.key] as number) : 0;
    });
    return p;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={chartData}
        margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
      >
        <CartesianGrid stroke="#efefef" vertical={false} />
        <XAxis
          dataKey={xDataKey}
          tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
          axisLine={false}
          tickLine={false}
          interval={xInterval}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
          axisLine={false}
          tickLine={false}
          ticks={yTicks}
          domain={yDomain}
        />
        <Tooltip content={<ChartTooltip flipOrder />} />
        {/* All Areas always mounted — never conditionally removed */}
        {series.map((s) => (
          <Area
            key={s.key}
            type="linear"
            dataKey={s.key}
            name={s.label}
            stackId="stack"
            stroke="none"
            strokeWidth={0}
            fill={s.color}
            fillOpacity={1}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  9. LINE USAGE CHART
//  Dual-line chart for Device Utilization (or any two time-series lines).
//
//  Props:
//    data      — array with xDataKey + the two series keys
//    lines     — exactly 2 SeriesItem entries (each needs key, label, color)
//    height    — chart height in px (default 280)
//    yTicks    — Y-axis tick values (default [0,6,12,18,24])
//    yDomain   — Y-axis domain (default [0,24])
//    xInterval — X-axis tick interval (default 0)
//
//  Usage:
//    <LineUsageChart
//      data={deviceData}
//      lines={[
//        { key: "meetings",    label: "Number of meetings",    color: "#6860C8" },
//        { key: "connections", label: "Number of connections", color: "#D44E80" },
//      ]}
//    />
// ════════════════════════════════════════════════════════════════════════════

export interface LineUsageChartProps {
  data: Record<string, string | number>[];
  lines: [SeriesItem, SeriesItem];
  height?: number;
  yTicks?: number[];
  yDomain?: [number, number];
  xInterval?: number;
  xDataKey?: string;
}

export function LineUsageChart({
  data,
  lines,
  height = 280,
  yTicks = [0, 6, 12, 18, 24],
  yDomain = [0, 24],
  xInterval = 0,
  xDataKey = "label",
}: LineUsageChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
      >
        <CartesianGrid stroke="#efefef" vertical={false} />
        <XAxis
          dataKey={xDataKey}
          tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
          axisLine={false}
          tickLine={false}
          interval={xInterval}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#aaa", fontFamily: "inherit" }}
          axisLine={false}
          tickLine={false}
          ticks={yTicks}
          domain={yDomain}
        />
        <Tooltip content={<ChartTooltip />} />
        {lines.map((l) => (
          <Line
            key={l.key}
            type="linear"
            dataKey={l.key}
            name={l.label}
            stroke={l.color}
            strokeWidth={2}
            dot={{ r: 4, fill: l.color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  CHART SECTION CARD
//  A bordered card wrapper for charts with title + subtitle.
//
//  Usage:
//    <ChartCard title="Device Utilization" subtitle="Compare usage data...">
//      <LineUsageChart ... />
//    </ChartCard>
// ════════════════════════════════════════════════════════════════════════════

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  footer,
}: ChartCardProps) {
  return (
    <div
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 14,
        padding: "20px 20px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h2>
      {subtitle && (
        <p style={{ margin: "3px 0 16px", fontSize: 12.5, color: "#888" }}>
          {subtitle}
        </p>
      )}
      {children}
      {footer && <div style={{ marginTop: 14 }}>{footer}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  DROPDOWN SELECT
//  A styled native <select> with chevron icon.
//
//  Usage:
//    <DropdownSelect
//      value={selectedGroup}
//      onChange={setSelectedGroup}
//      options={[{ value: "protocol", label: "Protocol" }, ...]}
//    />
// ════════════════════════════════════════════════════════════════════════════

export interface DropdownSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

export function DropdownSelect({
  value,
  onChange,
  options,
}: DropdownSelectProps) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          WebkitAppearance: "none",
          border: "1px solid #d0d0d0",
          borderRadius: 8,
          padding: "6px 30px 6px 12px",
          fontSize: 13,
          fontFamily: "inherit",
          color: "#333",
          background: "#fff",
          cursor: "pointer",
          outline: "none",
          fontWeight: 500,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <span
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
          <path
            d="M1 1L5.5 6L10 1"
            stroke="#666"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  TWO COLUMN GRID
//  Simple 2-col layout helper used in Updates section.
//
//  Usage:
//    <TwoColumnGrid>
//      <ReleaseNotesCard ... />
//      <FaqAccordion ... />
//    </TwoColumnGrid>
// ════════════════════════════════════════════════════════════════════════════

export function TwoColumnGrid({
  children,
  padding = "0 24px 28px",
}: {
  children: React.ReactNode;
  padding?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        padding,
      }}
    >
      {children}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//
//  ░░░░░░░░░░░░░░  USAGE EXAMPLES  ░░░░░░░░░░░░░░
//
//  Below are two example pages showing how to compose these components.
//
// ════════════════════════════════════════════════════════════════════════════

// ── Example 1: Monitoring Page ───────────────────────────────────────────────

export function MonitoringPageExample() {
  const faqItems: FaqItem[] = [
    {
      id: "1",
      question: "How can I activate a device?",
      answer: "Go to Settings > Devices and click Activate.",
    },
    {
      id: "2",
      question: "What network settings are needed?",
      answer: "Ports 3478 and 5349 must be open for WebRTC.",
    },
    {
      id: "3",
      question: "Where can I purchase add-ons?",
      answer: "Visit mersive.com/add-ons.",
    },
    {
      id: "4",
      question: "What is Infinite Routing?",
      answer: "Dynamic content routing across multiple displays.",
    },
  ];

  const release: ReleaseNote = {
    version: "Mersive v1.0.1",
    date: "April 10, 2024",
    bulletPoints: [
      "Release note bullet point",
      "Release note bullet point",
      "Release note bullet point",
    ],
    releaseNotesUrl: "#",
  };

  return (
    <div
      style={{
        fontFamily: "'Inter','Segoe UI',sans-serif",
        background: "#fff",
      }}
    >
      <StatCardRow>
        <StatCard
          icon={<span style={{ color: "white", fontSize: 18 }}>🖥</span>}
          label="Meetings underway"
          value="0"
        />
        <StatCard
          icon={<span style={{ color: "white", fontSize: 18 }}>👤</span>}
          label="Unique users"
          value="11"
        />
        <StatCard
          icon={<span style={{ color: "white", fontSize: 18 }}>⏱</span>}
          label="Average meeting length"
          value="50 min"
        />
        <StatCard
          icon={<span style={{ color: "white", fontSize: 18 }}>📈</span>}
          label="Busiest time"
          value="11 am"
          isLast
        />
      </StatCardRow>

      <SectionPanel title="Updates">
        <TwoColumnGrid>
          <ReleaseNotesCard release={release} />
          <FaqAccordion items={faqItems} />
        </TwoColumnGrid>
      </SectionPanel>
    </div>
  );
}

// ── Example 2: Analytics Usage Page ─────────────────────────────────────────

const TIME_OPTIONS: TimeRangeOption[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

const PROTOCOL_SERIES: SeriesItem[] = [
  { key: "hdmiIn", label: "HDMI in", color: "#E8902A" },
  { key: "googleCast", label: "Google Cast", color: "#7E9E2E" },
  { key: "miracast", label: "Miracast", color: "#4D9EC4" },
  { key: "airplay", label: "AirPlay", color: "#D44E80" },
  { key: "web", label: "Web", color: "#6860C8" },
];

const SAMPLE_AREA_DATA = [
  {
    label: "Dec 16",
    web: 4,
    airplay: 3,
    miracast: 2,
    googleCast: 1,
    hdmiIn: 1,
  },
  {
    label: "Dec 17",
    web: 5,
    airplay: 4,
    miracast: 2,
    googleCast: 1,
    hdmiIn: 1,
  },
  {
    label: "Dec 18",
    web: 0,
    airplay: 1,
    miracast: 0,
    googleCast: 0,
    hdmiIn: 0,
  },
  {
    label: "Dec 19",
    web: 6,
    airplay: 5,
    miracast: 3,
    googleCast: 2,
    hdmiIn: 1,
  },
  {
    label: "Dec 20",
    web: 8,
    airplay: 10,
    miracast: 4,
    googleCast: 6,
    hdmiIn: 1,
  },
  {
    label: "Dec 21",
    web: 3,
    airplay: 3,
    miracast: 2,
    googleCast: 2,
    hdmiIn: 1,
  },
  {
    label: "Dec 22",
    web: 0,
    airplay: 1,
    miracast: 0,
    googleCast: 0,
    hdmiIn: 0,
  },
];

const SAMPLE_LINE_DATA = [
  { label: "Dec 16", meetings: 10, connections: 11 },
  { label: "Dec 17", meetings: 13, connections: 14 },
  { label: "Dec 18", meetings: 3, connections: 3 },
  { label: "Dec 19", meetings: 11, connections: 12 },
  { label: "Dec 20", meetings: 20, connections: 22 },
  { label: "Dec 21", meetings: 4, connections: 4 },
  { label: "Dec 22", meetings: 2, connections: 2 },
];

export function AnalyticsPageExample() {
  const [range, setRange] = useState("7d");
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>(
    Object.fromEntries(PROTOCOL_SERIES.map((s) => [s.key, true])),
  );

  const toggle = (key: string) =>
    setActiveKeys((prev) => ({ ...prev, [key]: !prev[key] }));

  const legendItems = [...PROTOCOL_SERIES].reverse();

  return (
    <div
      style={{
        fontFamily: "'Inter','Segoe UI',sans-serif",
        background: "#fff",
        padding: "24px 28px",
      }}
    >
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Usage</h1>
        <TimeRangeBar
          options={TIME_OPTIONS}
          value={range}
          onChange={setRange}
        />
      </div>

      {/* Device Utilization chart */}
      <div style={{ marginBottom: 24 }}>
        <ChartCard
          title="Device Utilization"
          subtitle="Compare up to two types of usage data for devices in your organization"
        >
          <LineUsageChart
            data={SAMPLE_LINE_DATA}
            lines={[
              {
                key: "meetings",
                label: "Number of meetings",
                color: "#6860C8",
              },
              {
                key: "connections",
                label: "Number of connections",
                color: "#D44E80",
              },
            ]}
          />
        </ChartCard>
      </div>

      {/* User Connections chart */}
      <ChartCard
        title="User Connections"
        subtitle="Compare connection modes, sharing protocols, user operating systems, and types of conferencing solutions used"
        footer={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <DropdownSelect
              value="protocol"
              onChange={() => {}}
              options={[
                { value: "protocol", label: "Protocol" },
                { value: "os", label: "OS" },
              ]}
            />
            {legendItems.map((item, idx) => (
              <React.Fragment key={item.key}>
                <CheckPill
                  item={item}
                  checked={activeKeys[item.key]}
                  onToggle={() => toggle(item.key)}
                />
                {idx < legendItems.length - 1 && (
                  <span style={{ color: "#ddd", fontSize: 18 }}>|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        }
      >
        <StackedAreaChart
          data={SAMPLE_AREA_DATA}
          series={PROTOCOL_SERIES}
          activeKeys={activeKeys}
        />
      </ChartCard>
    </div>
  );
}
