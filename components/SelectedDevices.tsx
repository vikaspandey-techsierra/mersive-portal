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
import {
  SelectableDataTableHandle,
  SelectableDataTableProps,
  SortDir,
} from "@/lib/types/charts";
import { deriveDeviceRows, escapeCSV } from "@/lib/analytics/utils/helpers";
import { Checkbox } from "./Checkbox";
import { SortIcon } from "./SortIcon";

const defaultRender = (value: unknown): React.ReactNode =>
  value === null || value === undefined ? "-" : String(value);

function SelectableDataTableInner<T extends Record<string, unknown>>(
  {
    heading,
    subheading,
    searchPlaceholder = "Search",
    rows: rowsProp,
    rowKey,
    columns,
    defaultSortKey,
    defaultSortDir = "asc",
    defaultAllSelected = true,
    onSelectionChange,
    timeRange = "7d",
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

  const dynamicRows = useMemo(() => {
    if (rowsProp !== undefined) return null;
    return deriveDeviceRows(timeRange) as unknown as T[];
  }, [rowsProp, timeRange]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rows: T[] = rowsProp ?? dynamicRows ?? [];

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(defaultAllSelected ? rows.map((r) => String(r[rowKey])) : []),
  );

  const [internalLoading, setInternalLoading] = useState(
    isLoadingProp === undefined,
  );
  useEffect(() => {
    if (isLoadingProp !== undefined) return;
    const t = setTimeout(() => setInternalLoading(false), 2000);
    return () => clearTimeout(t);
  }, [isLoadingProp]);

  const isLoading = isLoadingProp ?? internalLoading;

  useEffect(() => {
    if (defaultAllSelected) {
      setSelected(new Set(rows.map((r) => String(r[rowKey]))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  useEffect(() => {
    onSelectionChange?.(new Set(selected));
  }, [selected, onSelectionChange]);

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

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        if (typeof av === "string" && typeof bv === "string") {
          return sortDir === "asc"
            ? av.localeCompare(bv)
            : bv.localeCompare(av);
        }
        return sortDir === "asc"
          ? (av as number) - (bv as number)
          : (bv as number) - (av as number);
      }),
    [filtered, sortKey, sortDir],
  );

  const exportCSV = () => {
    const selectedRows = sorted.filter((r) => selected.has(String(r[rowKey])));
    const header = columns.map((c) => escapeCSV(c.label)).join(",");
    const body = selectedRows
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => ({ exportCSV }), [sorted, selected, columns]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allVisibleSelected =
    sorted.length > 0 && sorted.every((r) => selected.has(String(r[rowKey])));

  const toggleAll = () => {
    if (allVisibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((r) => String(r[rowKey]))));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
                <Checkbox checked={allVisibleSelected} onChange={toggleAll} />
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

            {sorted.length === 0 && (
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

const SelectableDataTable = forwardRef(SelectableDataTableInner) as <
  T extends Record<string, unknown>,
>(
  props: SelectableDataTableProps<T> & {
    ref?: React.Ref<SelectableDataTableHandle>;
  },
) => ReturnType<typeof SelectableDataTableInner>;

export default SelectableDataTable;
