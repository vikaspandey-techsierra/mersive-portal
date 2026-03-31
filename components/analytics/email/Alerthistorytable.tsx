"use client";

import Image from "next/image";
import { useState } from "react";
import loader from "../../../components/icons/loading.svg";
import { DataTableProps, SortDir } from "@/lib/types/charts";

function SortArrows({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex flex-col ml-1 justify-center shrink-0">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`-mb-0.5 ${active && dir === "asc" ? "text-[#5E54C5]" : "text-[#9CA3AF]"}`}
      >
        <path
          d="M4 10L8 6L12 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`-mb-0.5 ${active && dir === "desc" ? "text-[#5E54C5]" : "text-[#9CA3AF]"}`}
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  loadingLabel = "Loading...",
  emptyMessage = "No results found",
  selectable = false,
  selectedKeys,
  rowKey,
  onSelectionChange,
  maxHeight,
  className = "",
}: DataTableProps<T>) {
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    new Set(),
  );
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const selected = selectedKeys ?? internalSelected;
  const setSelected = onSelectionChange ?? setInternalSelected;

  const getKey = (row: T, i: number) => rowKey?.(row, i) ?? String(i);

  // Sorting
  const sorted = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const av = a[sortField];
    const bv = b[sortField];
    const cmp =
      av == null ? -1 : bv == null ? 1 : av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const handleSort = (key: string) => {
    if (sortField === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(key);
      setSortDir("asc");
    }
  };

  // Checkbox logic
  const allKeys = sorted.map((r, i) => getKey(r, i));
  const allSelected =
    allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selected.has(k));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allKeys));
    }
  };

  const toggleRow = (key: string) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  return (
    <div
      className={`border border-[#E5E7EB] rounded-lg bg-white overflow-hidden ${className}`}
    >
      {/* Scrollable wrapper: horizontal always, vertical when maxHeight set */}
      <div
        className="overflow-x-auto overflow-y-auto"
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table
          className="w-full border-collapse text-sm"
          style={{ minWidth: "600px" }}
        >
          {/* Column widths */}
          <colgroup>
            {selectable && <col style={{ width: "44px" }} />}
            {columns.map((col) => (
              <col
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
              />
            ))}
          </colgroup>

          {/* Sticky header */}
          <thead className="border-b border-[#E5E7EB] sticky top-0 bg-white z-10">
            <tr>
              {selectable && (
                <th className="pl-4 py-3 w-11">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#5E54C5] focus:ring-[#5E54C5] cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => {
                const sortable = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    className={`text-left text-[12px] font-medium text-[#6B7280] py-3 pr-4 first:pl-4 whitespace-nowrap ${sortable ? "cursor-pointer select-none" : ""}`}
                    onClick={sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="inline-flex items-center">
                      {col.label}
                      {sortable && (
                        <SortArrows
                          active={sortField === col.key}
                          dir={sortDir}
                        />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-20 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Image
                      src={loader}
                      alt="Loading"
                      width={100}
                      height={100}
                      className="animate-spin"
                    />
                    <span className="text-[13px] text-[#9CA3AF]">
                      {loadingLabel}
                    </span>
                  </div>
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-[14px] text-[#9CA3AF]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => {
                const key = getKey(row, i);
                const isSelected = selected.has(key);
                return (
                  <tr
                    key={key}
                    className={`h-10.75 border-b border-[#F1F2F4] transition-colors ${
                      isSelected ? "bg-[#F5F4FF]" : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {selectable && (
                      <td className="pl-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(key)}
                          className="w-4 h-4 rounded border-gray-300 text-[#5E54C5] focus:ring-[#5E54C5] cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3 px-2 first:pl-4 ${col.cellClassName ?? ""}`}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
