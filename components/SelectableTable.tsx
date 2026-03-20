"use client";

import { useState, useMemo, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  PUBLIC TYPES                                                       */
/* ------------------------------------------------------------------ */

/** Describes one column in the table. */
export interface ColumnDef<T> {
  /** Property key on T used for sorting. */
  key: keyof T & string;
  /** Header label shown in the <th>. */
  label: string;
  /** Whether this column is sortable (default false). */
  sortable?: boolean;
  /**
   * Optional custom cell renderer.
   * If omitted the raw value is displayed (null → "-").
   */
  render?: (value: T[keyof T], item: T) => ReactNode;
}

export interface SelectableTableProps<T extends { id: string }> {
  /** Row data – each item MUST contain an `id: string` field. */
  data: T[];
  /** Column definitions (order determines render order). */
  columns: ColumnDef<T>[];
  /** Section title shown above the table. */
  title: string;
  /** Subtitle / helper text shown below the title. */
  subtitle?: string;
  /** The key on T used for full-text search filtering (defaults to "name"). */
  searchKey?: keyof T & string;
  /** Placeholder text for the search input (defaults to "Search"). */
  searchPlaceholder?: string;
  /** Show a loading overlay over the table. */
  isLoading?: boolean;
  /** Custom loading indicator element. If omitted a default spinner is used. */
  loadingIndicator?: ReactNode;
  /**
   * Controlled selected-id set.
   * When provided the component is "controlled" and `onSelectionChange` fires
   * on every toggle.  When omitted the component manages selection internally
   * (all rows selected by default).
   */
  selectedIds?: Set<string>;
  /** Fires whenever the set of selected ids changes. */
  onSelectionChange?: (ids: Set<string>) => void;
  /** Default sort column key (defaults to first column key). */
  defaultSortKey?: keyof T & string;
  /** Default sort direction (defaults to "asc"). */
  defaultSortDir?: "asc" | "desc";
}

/* ------------------------------------------------------------------ */
/*  INTERNAL TYPES                                                     */
/* ------------------------------------------------------------------ */

type SortDir = "asc" | "desc";

/* ------------------------------------------------------------------ */
/*  HELPERS                                                            */
/* ------------------------------------------------------------------ */

const defaultRender = (v: unknown): ReactNode =>
  v === null || v === undefined ? "-" : String(v);

/* ------------------------------------------------------------------ */
/*  SUB-COMPONENTS                                                     */
/* ------------------------------------------------------------------ */

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

const DefaultSpinner = () => (
  <svg
    className="animate-spin h-10 w-10 text-[#6860C8]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export default function SelectableTable<T extends { id: string }>(
  props: SelectableTableProps<T>,
) {
  const {
    data,
    columns,
    title,
    subtitle,
    searchKey = "name" as keyof T & string,
    searchPlaceholder = "Search",
    isLoading = false,
    loadingIndicator,
    selectedIds: controlledIds,
    onSelectionChange,
    defaultSortKey,
    defaultSortDir = "asc",
  } = props;

  /* ---- state ---- */
  const [search, setSearch] = useState("");

  const initialSortKey = defaultSortKey ?? columns[0]?.key ?? ("name" as keyof T & string);
  const [sortKey, setSortKey] = useState<keyof T & string>(initialSortKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);

  // All data ids — recalculated when data changes
  const allDataIds = useMemo(() => new Set(data.map((d) => d.id)), [data]);

  // Internal (uncontrolled) selection
  const [internalIds, setInternalIds] = useState<Set<string>>(allDataIds);

  // When data changes, reset internal selection to include all new ids
  const [prevAllDataIds, setPrevAllDataIds] = useState(allDataIds);
  if (prevAllDataIds !== allDataIds) {
    setPrevAllDataIds(allDataIds);
    setInternalIds(allDataIds);
  }

  const selected = controlledIds ?? internalIds;

  const setSelected = (next: Set<string>) => {
    if (controlledIds === undefined) {
      setInternalIds(next);
    }
    onSelectionChange?.(next);
  };

  /* ---- filtering & sorting ---- */

  const filtered = useMemo(
    () =>
      data.filter((d) => {
        const val = d[searchKey];
        if (typeof val !== "string") return true;
        return val.toLowerCase().includes(search.toLowerCase());
      }),
    [data, search, searchKey],
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;

      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }

      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortDir]);

  /* ---- handlers ---- */

  const handleSort = (key: keyof T & string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allSelected = sorted.length > 0 && sorted.every((d) => selected.has(d.id));
  const someSelected = sorted.some((d) => selected.has(d.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((d) => d.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  /* ---- render ---- */

  return (
    <div className="mb-8 w-full min-w-0">
      <div className="font-bold text-lg text-black mb-1">
        {title} ({selected.size})
      </div>

      {subtitle && (
        <div className="text-sm text-gray-400 mb-4">{subtitle}</div>
      )}

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

      {/* Scroll container */}
      <div className="relative w-full overflow-x-auto overflow-y-auto max-h-80 border border-gray-200 rounded-lg">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white rounded-lg">
            {loadingIndicator ?? <DefaultSpinner />}
          </div>
        )}

        <table className="min-w-225 w-full">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 w-12">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
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
                      <SortIcon
                        active={sortKey === col.key}
                        dir={sortDir}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.map((item, idx) => {
              const isChecked = selected.has(item.id);

              return (
                <tr
                  key={item.id}
                  onClick={() => toggleOne(item.id)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    idx < sorted.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  <td className="px-6 py-4 w-12">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => toggleOne(item.id)}
                    />
                  </td>

                  {columns.map((col, colIdx) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm ${
                        colIdx === 0 && isChecked
                          ? "font-semibold text-black"
                          : colIdx === 0
                            ? "text-black"
                            : "text-gray-700"
                      }`}
                    >
                      {col.render
                        ? col.render(item[col.key], item)
                        : defaultRender(item[col.key])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
