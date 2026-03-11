"use client";

import { useState, useMemo, useEffect } from "react";

/* TYPES  */

interface Device {
  id: string;
  name: string;
  meetings: number | null;
  totalUsers: number | null;
  hoursInUse: number | null;
  contentItems: number | null;
  avgDuration: string | null;
  avgDurationMinutes: number | null;
  contentTypes: number | null;
}

type SortKey =
  | "name"
  | "meetings"
  | "totalUsers"
  | "hoursInUse"
  | "contentItems"
  | "avgDurationMinutes"
  | "contentTypes";

type SortDir = "asc" | "desc";

/*  MOCK DATA */

const MOCK_DEVICES: Device[] = [
  {
    id: "1",
    name: "Board Room",
    meetings: 2,
    totalUsers: 3,
    hoursInUse: 2,
    contentItems: 1,
    avgDuration: "1 hr",
    avgDurationMinutes: 60,
    contentTypes: 2,
  },
  {
    id: "2",
    name: "Corner Conference",
    meetings: 1,
    totalUsers: 2,
    hoursInUse: 0.5,
    contentItems: 2,
    avgDuration: "30 min",
    avgDurationMinutes: 30,
    contentTypes: 1,
  },
  {
    id: "3",
    name: "Hallway",
    meetings: 1,
    totalUsers: 1,
    hoursInUse: 0.75,
    contentItems: 1,
    avgDuration: "45 min",
    avgDurationMinutes: 45,
    contentTypes: 1,
  },
  {
    id: "4",
    name: "John's Office",
    meetings: 2,
    totalUsers: 1,
    hoursInUse: 4,
    contentItems: 4,
    avgDuration: "2 hrs",
    avgDurationMinutes: 120,
    contentTypes: 3,
  },
  {
    id: "5",
    name: "Temp Office",
    meetings: null,
    totalUsers: null,
    hoursInUse: null,
    contentItems: null,
    avgDuration: null,
    avgDurationMinutes: null,
    contentTypes: null,
  },
];

/*  HELPERS  */

const fmt = (v: number | null) => (v === null ? "-" : String(v));

/* LOADER SVG — inlined from design asset */

const LoaderSVG = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="animate-spin"
    style={{ animationDuration: "1s" }}
  >
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

/*  SORT ICON  */

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

/*  CHECKBOX  */

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

/*  HEADER CELL  */

interface ThProps {
  label: string;
  sortable?: boolean;
  sk?: SortKey;
  activeSortKey: SortKey;
  activeSortDir: SortDir;
  onSort: (key: SortKey) => void;
}

const Th = ({
  label,
  sortable,
  sk,
  activeSortKey,
  activeSortDir,
  onSort,
}: ThProps) => (
  <th
    onClick={sortable && sk ? () => onSort(sk) : undefined}
    className={`px-6 py-3 text-left text-sm font-medium text-gray-500 whitespace-nowrap select-none ${
      sortable ? "cursor-pointer" : ""
    }`}
  >
    <span className="inline-flex items-center">
      {label}
      {sortable && sk && (
        <SortIcon active={activeSortKey === sk} dir={activeSortDir} />
      )}
    </span>
  </th>
);

/*  MAIN COMPONENT  */

export default function SelectedDevices() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(MOCK_DEVICES.map((d) => d.id)),
  );

  // Simulated loading state — replace `setIsLoading(false)` trigger
  // with your actual data-fetch completion (e.g. after await fetchDevices())
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(
    () =>
      MOCK_DEVICES.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];

      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;

      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }

      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allSelected = sorted.every((d) => selected.has(d.id));
  const someSelected = sorted.some((d) => selected.has(d.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(sorted.map((d) => d.id)));
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

  const sortProps = {
    activeSortKey: sortKey,
    activeSortDir: sortDir,
    onSort: handleSort,
  };

  return (
    <div className="mb-8 w-full min-w-0">
      <div className="font-bold text-lg text-black mb-1">
        Selected Devices ({selected.size})
      </div>

      <div className="text-sm text-gray-400 mb-4">
        Select all or narrow the data down to a specific group of devices
      </div>

      <div className="mb-6">
        <div className="inline-flex items-center border border-gray-200 rounded-lg px-3 py-2 bg-white w-full sm:w-60">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none text-sm text-gray-800 bg-transparent w-full"
          />
        </div>
      </div>

      {/* Scroll container — relative so the loader overlay can be absolute */}
      <div className="relative w-full overflow-x-auto overflow-y-auto max-h-80 border border-gray-200 rounded-lg">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 mt-15 flex items-center justify-center bg-white rounded-lg">
            <LoaderSVG />
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
              <Th label="Name" sortable sk="name" {...sortProps} />
              <Th label="Meetings" sortable sk="meetings" {...sortProps} />
              <Th label="Total Users" sortable sk="totalUsers" {...sortProps} />
              <Th
                label="Hours in Use"
                sortable
                sk="hoursInUse"
                {...sortProps}
              />
              <Th
                label="Content Items"
                sortable
                sk="contentItems"
                {...sortProps}
              />
              <Th
                label="Avg. Duration"
                sortable
                sk="avgDurationMinutes"
                {...sortProps}
              />
              <Th
                label="Content Types"
                sortable
                sk="contentTypes"
                {...sortProps}
              />
            </tr>
          </thead>

          <tbody>
            {sorted.map((device, idx) => {
              const isChecked = selected.has(device.id);

              return (
                <tr
                  key={device.id}
                  onClick={() => toggleOne(device.id)}
                  className={`cursor-pointer hover:bg-gray-50 ${
                    idx < sorted.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <td className="px-6 py-4 w-12">
                    <Checkbox
                      checked={isChecked}
                      onChange={() => toggleOne(device.id)}
                    />
                  </td>

                  <td
                    className={`px-6 py-4 text-sm ${
                      isChecked ? "font-semibold text-black" : "text-black"
                    }`}
                  >
                    {device.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {fmt(device.meetings)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {fmt(device.totalUsers)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {device.hoursInUse === null ? "-" : device.hoursInUse}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {fmt(device.contentItems)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {device.avgDuration ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {fmt(device.contentTypes)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
