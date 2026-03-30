"use client";

import { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { DropdownRowProps, MetricDropdownProps } from "@/lib/types/charts";

export function MetricDropdown<T extends string = string>({
  value,
  options,
  color,
  onChange,
  disabledValue,
  showNone = false,
  placeholder = "None",
}: MetricDropdownProps<T>) {
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

  const currentLabel =
    value != null
      ? (options.find((o) => o.value === value)?.label ?? placeholder)
      : placeholder;

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-white text-[13px] font-medium rounded-md px-4 py-1.5 whitespace-nowrap"
        style={{ background: color }}
      >
        {currentLabel}
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
            <DropdownRow
              label={placeholder}
              isSelected={value === null}
              isDisabled={false}
              onSelect={() => {
                onChange(null);
                setOpen(false);
              }}
            />
          )}

          {options.map((opt) => (
            <DropdownRow
              key={opt.value}
              label={opt.label}
              isSelected={value === opt.value}
              isDisabled={opt.value === disabledValue}
              onSelect={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DropdownRow({
  label,
  isSelected,
  isDisabled,
  onSelect,
}: DropdownRowProps) {
  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      className={[
        "flex items-center justify-between px-4 py-2.5 text-sm transition",
        isDisabled
          ? "text-gray-400 cursor-default"
          : "cursor-pointer hover:bg-gray-100 text-gray-800",
        isSelected ? "font-medium" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{label}</span>
      {isSelected && (
        <Check size={16} strokeWidth={2.5} className="text-[#6860C8]" />
      )}
    </div>
  );
}
