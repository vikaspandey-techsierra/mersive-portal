"use client";

import Image from "next/image";
import {
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import loading from "../components/icons/loading.svg";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */

export type SortDir = "asc" | "desc";

export interface ColumnDef<T extends Record<string, unknown>> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  /**
   * Plain-text value for CSV export.
   * Required when `render` returns JSX — otherwise the CSV will contain "[object Object]".
   */
  csvValue?: (value: T[keyof T], row: T) => string | number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  cellClassName?: string;
}

export interface SelectableDataTableProps<T extends Record<string, unknown>> {
  heading: string;
  subheading: string;
  searchPlaceholder?: string;

  rows: T[];
  rowKey: keyof T & string;
  columns: ColumnDef<T>[];

  defaultSortKey?: keyof T & string;
  defaultSortDir?: SortDir;

  defaultAllSelected?: boolean;
  /**
   * Fired whenever the selection changes.
   * Receives the Set of selected row-key values AND the array of selected row objects.
   */
  onSelectionChange?: (selectedIds: Set<string>, selectedRows: T[]) => void;

  isLoading?: boolean;
  csvFilename?: string;
}

/** Handle exposed via ref */
export interface SelectableDataTableHandle {
  exportCSV: () => void;
  /** IDs (rowKey values) of currently checked rows */
  selectedIds: Set<string>;
  /** Full row objects for currently checked rows */
  selectedRows: unknown[];
}

/* ─────────────────────────────────────────────
   INTERNAL HELPERS
───────────────────────────────────────────── */

const defaultRender = (value: unknown): React.ReactNode =>
  value === null || value === undefined ? "-" : String(value);

function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/* ─────────────────────────────────────────────
   SORT ICON
───────────────────────────────────────────── */

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span className="ml-1 inline-flex flex-col items-center justify-center gap-0.5">
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path
        d="M2 4L5 1L8 4"
        stroke={active && dir === "asc" ? "#6860C8" : "#9CA3AF"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path
        d="M2 2L5 5L8 2"
        stroke={active && dir === "desc" ? "#6860C8" : "#9CA3AF"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

/* ─────────────────────────────────────────────
   CHECKBOX
───────────────────────────────────────────── */

const Checkbox = ({
  checked,
  onChange,
  indeterminate,
}: {
  checked: boolean;
  onChange: () => void;
  indeterminate?: boolean;
}) => (
  <span
    onClick={(e) => {
      e.stopPropagation();
      onChange();
    }}
    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors
      ${
        checked || indeterminate
          ? "bg-[#6860C8] border-[#6860C8]"
          : "bg-white border-gray-300"
      }`}
  >
    {indeterminate && !checked ? (
      <span className="w-2.5 h-0.5 bg-white rounded-sm" />
    ) : checked ? (
      <svg width="11" height="9" viewBox="0 0 11 9">
        <path
          d="M1 4.5L4 7.5L10 1"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : null}
  </span>
);

/* ─────────────────────────────────────────────
   INNER COMPONENT
───────────────────────────────────────────── */

function SelectableDataTableInner<T extends Record<string, unknown>>(
  {
    heading,
    subheading,
    searchPlaceholder = "Search",
    rows,
    rowKey,
    columns,
    defaultSortKey,
    defaultSortDir = "asc",
    defaultAllSelected = true,
    onSelectionChange,
    isLoading: isLoadingProp,
    csvFilename = "export",
  }: SelectableDataTableProps<T>,
  ref: React.Ref<SelectableDataTableHandle>,
) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string>(
    defaultSortKey ?? columns[0]?.key ?? "",
  );
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultAllSelected ? rows.map((r) => String(r[rowKey])) : []),
  );

  // Internal simulated loading
  const [internalLoading, setInternalLoading] = useState(
    isLoadingProp === undefined,
  );
  useEffect(() => {
    if (isLoadingProp !== undefined) return;
    const t = setTimeout(() => setInternalLoading(false), 2000);
    return () => clearTimeout(t);
  }, [isLoadingProp]);

  const isLoading = isLoadingProp ?? internalLoading;

  // Re-select all when rows change (e.g. after data fetch)
  useEffect(() => {
    if (defaultAllSelected) {
      setSelected(new Set(rows.map((r) => String(r[rowKey]))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  /* ── Derived selected rows ── */
  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(String(r[rowKey]))),
    [rows, selected, rowKey],
  );

  /**
   * Effective selection for charts:
   * When ALL rows are unchecked, treat it as if all are selected
   * so charts never go blank.
   */
  const effectiveSelectedIds = useMemo(() => {
    if (selected.size === 0) return new Set(rows.map((r) => String(r[rowKey])));
    return selected;
  }, [selected, rows, rowKey]);

  const effectiveSelectedRows = useMemo(
    () =>
      selected.size === 0
        ? rows
        : rows.filter((r) => selected.has(String(r[rowKey]))),
    [selected, rows, rowKey],
  );

  // Notify parent on selection change (uses effective values for chart updates)
  useEffect(() => {
    onSelectionChange?.(effectiveSelectedIds, effectiveSelectedRows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSelectedIds]);

  /* ── Filter ── */
  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const searchable = columns
          .map((c) => String(r[c.key] ?? ""))
          .join(" ")
          .toLowerCase();
        return searchable.includes(search.toLowerCase());
      }),
    [rows, columns, search],
  );

  /* ── Sort ── */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortDir]);

  /* ── CSV Export ── */
  const exportCSV = () => {
    const rowsToExport = sorted.filter((r) => selected.has(String(r[rowKey])));
    const header = columns.map((c) => escapeCSV(c.label)).join(",");
    const body = rowsToExport
      .map((row) =>
        columns
          .map((col) => {
            const raw = col.csvValue
              ? col.csvValue(row[col.key], row)
              : row[col.key];
            return escapeCSV(raw);
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${csvFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Expose handle ── */
  useImperativeHandle(
    ref,
    () => ({
      exportCSV,
      selectedIds: selected,
      selectedRows,
    }),
    [sorted, selected, columns, selectedRows],
  );

  /* ── Selection handlers ── */
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  /**
   * Header checkbox logic per spec:
   * - Checked ONLY when ALL rows are checked
   * - Unchecking header → uncheck all rows
   * - Checking header → check all rows
   * No indeterminate state for the header.
   */
  const allSelected =
    sorted.length > 0 && sorted.every((r) => selected.has(String(r[rowKey])));

  const toggleAll = () => {
    if (allSelected) {
      // Uncheck all
      setSelected(new Set());
    } else {
      // Check all
      setSelected(new Set(sorted.map((r) => String(r[rowKey]))));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  /* ── Render ── */
  return (
    <div className="mb-8 w-full min-w-0">
      <div className="font-bold text-lg text-black mb-1">
        {heading} ({selected.size})
      </div>
      <div className="text-sm text-gray-400 mb-4">{subheading}</div>

      <div className="mb-6">
        <div className="inline-flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white w-full sm:w-60">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-800 bg-transparent w-full"
          />
        </div>
      </div>

      <div className="relative w-full overflow-x-auto overflow-y-auto max-h-80 border border-gray-200 rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 z-20 mt-15 flex items-center justify-center bg-white rounded-lg">
            <Image
              src={loading}
              alt="Loading"
              width={100}
              height={100}
              className="animate-spin"
            />
          </div>
        )}

        <table className="min-w-max w-full">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 w-12">
                {/* Header checkbox: checked only when ALL rows are checked */}
                <Checkbox
                  checked={allSelected}
                  indeterminate={false}
                  onChange={toggleAll}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={`px-6 py-3 text-left text-sm font-medium text-gray-500 whitespace-nowrap select-none ${
                    col.sortable ? "cursor-pointer" : ""
                  }`}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && (
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.map((row, idx) => {
              const id = String(row[rowKey]);
              const isChecked = selected.has(id);

              return (
                <tr
                  key={id}
                  onClick={() => toggleOne(id)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    idx < sorted.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <td className="px-6 py-4 w-12">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => toggleOne(id)}
                    />
                  </td>
                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm ${
                        colIdx === 0
                          ? isChecked
                            ? "font-semibold text-black"
                            : "text-black"
                          : "text-gray-700"
                      } ${col.cellClassName ?? ""}`}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : defaultRender(row[col.key])}
                    </td>
                  ))}
                </tr>
              );
            })}

            {sorted.length === 0 && !isLoading && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-6 py-8 text-center text-sm text-gray-400"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   EXPORT — cast preserves generic T through forwardRef
───────────────────────────────────────────── */

const SelectableDataTable = forwardRef(SelectableDataTableInner) as <
  T extends Record<string, unknown>,
>(
  props: SelectableDataTableProps<T> & {
    ref?: React.Ref<SelectableDataTableHandle>;
  },
) => ReturnType<typeof SelectableDataTableInner>;

export default SelectableDataTable;
