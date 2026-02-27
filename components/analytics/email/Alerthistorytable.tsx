"use client";

import { useState, ReactNode } from "react";

// ─── Loading Spinner (from SVG asset) ────────────────────────────────────────

export function LoadingSpinner({ size = 64 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        animation: "spin 1s linear infinite",
      }}
    >
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <path
        d="M50 100C43.2515 100 36.703 98.6773 30.5366 96.0696C24.5825 93.5515 19.2351 89.9466 14.6452 85.3558C10.0543 80.7649 6.45037 75.4184 3.93135 69.4643C1.32272 63.296 0 56.7485 0 50C0 43.2515 1.32272 36.703 3.93041 30.5366C6.44848 24.5825 10.0534 19.2351 14.6442 14.6452C19.2351 10.0543 24.5816 6.45037 30.5357 3.93135C36.703 1.32272 43.2515 0 50 0C56.7485 0 63.297 1.32272 69.4634 3.93041C75.4175 6.44848 80.765 10.0534 85.3548 14.6442C89.9457 19.2351 93.5496 24.5816 96.0687 30.5357C98.6773 36.7021 99.9991 43.2506 99.9991 49.9991C99.9991 51.0793 99.9642 52.1709 99.8953 53.2436L92.2184 52.7511C92.2769 51.8416 92.3062 50.9151 92.3062 49.9991C92.3062 44.2855 91.1882 38.7456 88.9833 33.5321C86.853 28.495 83.8019 23.9693 79.9149 20.0832C76.0279 16.1962 71.5031 13.1451 66.466 11.0148C61.2525 8.80993 55.7126 7.69195 49.9991 7.69195C44.2855 7.69195 38.7456 8.80993 33.5321 11.0148C28.495 13.1451 23.9693 16.1962 20.0832 20.0832C16.1962 23.9702 13.1451 28.495 11.0148 33.5321C8.80993 38.7456 7.69195 44.2855 7.69195 49.9991C7.69195 55.7126 8.80993 61.2525 11.0148 66.466C13.1451 71.5031 16.1962 76.0288 20.0832 79.9149C23.9702 83.8019 28.495 86.853 33.5321 88.9833C38.7456 91.1882 44.2855 92.3062 49.9991 92.3062C57.692 92.3062 65.2216 90.2221 71.7748 86.2804C78.1459 82.4481 83.4189 76.9874 87.0229 70.4908L93.7497 74.2221C89.4919 81.8961 83.2651 88.3456 75.7401 92.8722C67.9897 97.5348 59.0892 99.9991 49.9991 99.9991L50 100Z"
        fill="#5E54C5"
      />
      <path
        d="M94.2293 66.5283C96.3536 66.5283 98.0757 64.8062 98.0757 62.6819C98.0757 60.5576 96.3536 58.8354 94.2293 58.8354C92.1049 58.8354 90.3828 60.5576 90.3828 62.6819C90.3828 64.8062 92.1049 66.5283 94.2293 66.5283Z"
        fill="#5E54C5"
      />
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortDir = "asc" | "desc";

export interface ColumnDef<T> {
  /** Unique key, used for sorting */
  key: keyof T & string;
  label: string;
  /** Optional fixed width e.g. "120px" or "10%" */
  width?: string;
  /** Custom cell renderer */
  render?: (value: T[keyof T], row: T) => ReactNode;
  /** Allow sorting on this column (default true) */
  sortable?: boolean;
  /** Tailwind classes for the cell */
  cellClassName?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Row data */
  data: T[];
  /** Show loading state */
  loading?: boolean;
  /** Loading spinner label */
  loadingLabel?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Show a checkbox in the first column */
  selectable?: boolean;
  /** Controlled selected row keys */
  selectedKeys?: Set<string>;
  /** Row key accessor (defaults to index) */
  rowKey?: (row: T, index: number) => string;
  /** Callback when selection changes */
  onSelectionChange?: (keys: Set<string>) => void;
  /** Optional max height to enable vertical scroll (e.g. "400px") */
  maxHeight?: string;
  /** Additional className on the outer wrapper */
  className?: string;
}

// ─── Sort Arrow ───────────────────────────────────────────────────────────────

function SortArrows({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="inline-flex flex-col ml-1 justify-center shrink-0">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`-mb-[2px] ${active && dir === "asc" ? "text-[#5E54C5]" : "text-[#9CA3AF]"}`}
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
        className={`-mt-[2px] ${active && dir === "desc" ? "text-[#5E54C5]" : "text-[#9CA3AF]"}`}
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

// ─── DataTable ────────────────────────────────────────────────────────────────

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
                <th className="pl-4 py-[12px] w-[44px]">
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
                    className={`text-left text-[12px] font-medium text-[#6B7280] py-[12px] pr-4 first:pl-4 whitespace-nowrap ${sortable ? "cursor-pointer select-none" : ""}`}
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
                    <LoadingSpinner size={56} />
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
                    className={`h-[43px] border-b border-[#F1F2F4] transition-colors ${
                      isSelected ? "bg-[#F5F4FF]" : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    {selectable && (
                      <td className="pl-4 py-[12px]">
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
                        className={`py-[12px] px-[8px] first:pl-4 ${col.cellClassName ?? ""}`}
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
