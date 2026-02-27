"use client";

import { useState, useEffect } from "react";
import {
  AnalyticsApiResponse,
  DAY_COUNTS,
  generateMockData,
  isValidEmail,
  tickInterval,
} from "@/lib/homePage";
import { AlertConfig, AlertHistoryRow, Recipient } from "@/lib/types/homepage";
import AlertGraph from "@/components/AlertGraph";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_HISTORY: AlertHistoryRow[] = [
  {
    date: "December 16th 2025, 8:45AM",
    timeAgo: "6 days ago",
    name: "Board Room",
    id: "PD0104A0001",
    description: "Device rebooted",
    recipients: "jflores@mersive.com, rkumar@mersive.com",
  },
  {
    date: "December 16th 2025, 9:45AM",
    timeAgo: "6 days ago",
    name: "Corner Conference",
    id: "PD0104A0002",
    description: "Device unreachable for 10 minutes",
    recipients: "itsupport@mersive.com",
  },
  {
    date: "December 16th 2025, 10:45AM",
    timeAgo: "6 days ago",
    name: "Hallway",
    id: "PD0104A0003",
    description: "Device firmware update from 15.0 to 15.1 failed",
    recipients:
      "itsupport@mersive.com, jflores@mersive.com, rkumar@mersive.com",
  },
  {
    date: "December 16th 2025, 11:45AM",
    timeAgo: "6 days ago",
    name: "John's Office",
    id: "PD0104A0004",
    description: "Device firmware update from 15.0 to 15.0.3 completed",
    recipients: "jflores@mersive.com, rkumar@mersive.com",
  },
];

const DEFAULT_ALERT_CONFIG: AlertConfig = {
  unreachable: false,
  unreachableMinutes: 5,
  rebooted: false,
  unassignedFromTemplate: false,
  firmwareAvailable: false,
  firmwareAboutToBegin: false,
  firmwareCompleted: false,
};

const MAX_RECIPIENTS = 5;

// ─── Loading Spinner ──────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
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
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
        checked ? "bg-[#5E54C5]" : "bg-gray-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Alert Row ────────────────────────────────────────────────────────────────

function AlertRow({
  label,
  checked,
  onChange,
  minutes,
  onMinutesChange,
  showMinutes = false,
}: {
  label?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  minutes?: number;
  onMinutesChange?: (v: number) => void;
  showMinutes?: boolean;
}) {
  return (
    <div className="flex items-center h-[44px] gap-[12px] px-3">
      <Toggle checked={checked} onChange={onChange} />
      <span className="text-[14px] font-normal text-[#374151] flex items-center gap-[8px] leading-[20px]">
        {showMinutes ? (
          <>
            <span>Email when a Pod is unreachable for</span>
            <div className="flex items-center h-[32px] border border-[#D1D5DB] rounded-[8px] px-2 bg-white">
              <input
                type="number"
                min={1}
                max={60}
                value={minutes ?? 5}
                onChange={(e) => onMinutesChange?.(Number(e.target.value))}
                className="w-[32px] text-[14px] text-[#111827] text-center focus:outline-none bg-transparent"
              />
              <div className="flex flex-col ml-[6px] justify-center">
                {/* UP */}
                <button
                  type="button"
                  onClick={() =>
                    onMinutesChange?.(Math.min(60, (minutes ?? 5) + 1))
                  }
                  className="flex items-center justify-center h-[10px]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-[#6B7280]"
                  >
                    <path
                      d="M4 10L8 6L12 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {/* DOWN */}
                <button
                  type="button"
                  onClick={() =>
                    onMinutesChange?.(Math.max(1, (minutes ?? 5) - 1))
                  }
                  className="flex items-center justify-center h-[10px]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-[#6B7280]"
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <span className="text-[14px] text-[#374151] ml-[8px]">minutes</span>
          </>
        ) : (
          label
        )}
      </span>
    </div>
  );
}

// ─── Alert Config Section ─────────────────────────────────────────────────────

function AlertConfigSection({
  config,
  onChange,
}: {
  config: AlertConfig;
  onChange: (patch: Partial<AlertConfig>) => void;
}) {
  return (
    <div>
      <AlertRow
        showMinutes
        checked={config.unreachable}
        onChange={(v) => onChange({ unreachable: v })}
        minutes={config.unreachableMinutes}
        onMinutesChange={(v) => onChange({ unreachableMinutes: v })}
      />
      <AlertRow
        label="Email when a Pod is rebooted"
        checked={config.rebooted}
        onChange={(v) => onChange({ rebooted: v })}
      />
      <AlertRow
        label="Email when a Pod is unassigned from a template"
        checked={config.unassignedFromTemplate}
        onChange={(v) => onChange({ unassignedFromTemplate: v })}
      />
      <AlertRow
        label="Email when a firmware update is available"
        checked={config.firmwareAvailable}
        onChange={(v) => onChange({ firmwareAvailable: v })}
      />
      <AlertRow
        label="Email when a firmware update is about to begin"
        checked={config.firmwareAboutToBegin}
        onChange={(v) => onChange({ firmwareAboutToBegin: v })}
      />
      <AlertRow
        label="Email when a firmware update is completed"
        checked={config.firmwareCompleted}
        onChange={(v) => onChange({ firmwareCompleted: v })}
      />
    </div>
  );
}

// ─── Recipient Card ───────────────────────────────────────────────────────────

function RecipientCard({
  recipient,
  onChange,
  onRemove,
  emailError,
}: {
  recipient: Recipient;
  onChange: (r: Recipient) => void;
  onRemove: () => void;
  emailError?: string;
}) {
  return (
    <div className="border border-[#E5E7EB] rounded-lg p-4 mb-3 bg-white">
      <div className="flex items-start justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">
          Recipient Email<span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Remove recipient"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <input
        type="text"
        value={recipient.email}
        onChange={(e) => onChange({ ...recipient, email: e.target.value })}
        placeholder="user1@example.org"
        className={`w-full rounded border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
          emailError ? "border-red-400 bg-red-50" : "border-gray-300"
        }`}
      />

      {emailError ? (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <svg
            className="w-3 h-3 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {emailError}
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-1">
          Separate multiple email addresses with a comma
        </p>
      )}

      <div className="mt-2">
        <AlertConfigSection
          config={recipient.alerts}
          onChange={(patch) =>
            onChange({
              ...recipient,
              alerts: { ...recipient.alerts, ...patch },
            })
          }
        />
      </div>
    </div>
  );
}

// ─── Alert History ────────────────────────────────────────────────────────────

type HistoryFilter = "my" | "all";
type SortField = keyof AlertHistoryRow;
type SortDir = "asc" | "desc";

function SortArrows({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className="flex flex-col ml-1 justify-center">
      {/* UP */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`-mb-[2px] ${
          active && dir === "asc" ? "text-[#5E54C5]" : "text-[#9CA3AF]"
        }`}
      >
        <path
          d="M4 10L8 6L12 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {/* DOWN */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={`-mt-[2px] ${
          active && dir === "desc" ? "text-[#5E54C5]" : "text-[#9CA3AF]"
        }`}
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

function Th({
  label,
  field,
  sortField,
  sortDir,
  handleSort,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  handleSort: (field: SortField) => void;
}) {
  return (
    <th
      className="text-left text-[12px] font-medium text-[#6B7280] py-[12px] pr-4 first:pl-4 cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortArrows active={sortField === field} dir={sortDir} />
      </span>
    </th>
  );
}

function AlertHistorySection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("my");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data fetch — replace setTimeout body with your actual API call
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const rows = MOCK_HISTORY.filter((row) => {
    const q = search.toLowerCase();
    return (
      !q ||
      row.name.toLowerCase().includes(q) ||
      row.id.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q) ||
      row.recipients.toLowerCase().includes(q)
    );
  }).sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-5">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[300px] h-[40px] pl-9 pr-3 text-[13px] text-[#111827] border border-[#D1D5DB] rounded-[8px] focus:outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex h-[32px] border border-[#D1D5DB] rounded-[8px] overflow-hidden">
            <button
              type="button"
              onClick={() => setFilter("my")}
              className={`w-[120px] text-[13px] font-medium flex items-center justify-center transition-colors ${
                filter === "my"
                  ? "bg-[#5E54C5] text-white"
                  : "bg-white text-[#374151]"
              }`}
            >
              My alerts
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`w-[120px] text-[13px] font-medium flex items-center justify-center transition-colors border-l border-[#E5E7EB] ${
                filter === "all"
                  ? "bg-[#5E54C5] text-white"
                  : "bg-white text-[#374151]"
              }`}
            >
              All alerts
            </button>
          </div>
        </div>

        {/* Export */}
        <button
          type="button"
          className="flex items-center gap-[6px] px-[12px] h-[32px] text-[13px] font-medium border border-[#D1D5DB] rounded-[8px] bg-white hover:bg-gray-50 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-[#374151]"
          >
            <path
              d="M8 2V10M8 10L5.5 7.5M8 10L10.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 12.5H13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Export to CSV
        </button>
      </div>

      {/* Table */}
      <div className="border border-[#E5E7EB] rounded-[8px] overflow-x-auto bg-white">
        <table className="w-full table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[370px]" />
            <col className="w-[350px]" />
            <col className="w-[140px]" />
            <col className="w-[410px]" />
            <col className="w-[400px]" />
          </colgroup>

          <thead className="border-b border-[#E5E7EB]">
            <tr>
              <Th
                label="Date"
                field="date"
                sortField={sortField}
                sortDir={sortDir}
                handleSort={handleSort}
              />
              <Th
                label="Name"
                field="name"
                sortField={sortField}
                sortDir={sortDir}
                handleSort={handleSort}
              />
              <Th
                label="ID"
                field="id"
                sortField={sortField}
                sortDir={sortDir}
                handleSort={handleSort}
              />
              <Th
                label="Description"
                field="description"
                sortField={sortField}
                sortDir={sortDir}
                handleSort={handleSort}
              />
              <Th
                label="Recipients"
                field="recipients"
                sortField={sortField}
                sortDir={sortDir}
                handleSort={handleSort}
              />
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center">
                  <div className="flex justify-center items-center">
                    <LoadingSpinner />
                  </div>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  No alerts found
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className="h-[43px] border-b border-[#F1F2F4] hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="py-[12px] px-[8px] whitespace-nowrap">
                    <span className="text-[14px] font-[500] text-[#090814]">
                      {row.date} – {row.timeAgo}
                    </span>
                  </td>

                  <td className="py-[12px] px-[8px] text-[14px] font-[500] text-[#090814]">
                    {row.name}
                  </td>

                  <td className="py-[12px] px-[8px] text-[12px] font-mono text-[#6B7280]">
                    {row.id}
                  </td>

                  <td className="py-[12px] px-[8px] text-[14px] text-[#374151]">
                    {row.description}
                  </td>

                  <td className="py-[12px] px-[8px] text-[13px] text-[#6B7280] truncate">
                    {row.recipients}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MOCK: Record<string, AnalyticsApiResponse> = {
  "7d": generateMockData(7),
  "30d": generateMockData(30),
  "60d": generateMockData(60),
  "90d": generateMockData(90),
  all: generateMockData(120),
};

type TimeRange = "7d" | "30d" | "60d" | "90d" | "all";

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "60d", label: "Last 60 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "all", label: "All time" },
];

export default function EmailAlertsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"my" | "additional">("my");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const apiData = MOCK[timeRange];
  const days = DAY_COUNTS[timeRange];
  const interval = tickInterval(days);

  const [myAlerts, setMyAlerts] = useState<AlertConfig>({
    unreachable: true,
    unreachableMinutes: 5,
    rebooted: true,
    unassignedFromTemplate: true,
    firmwareAvailable: true,
    firmwareAboutToBegin: true,
    firmwareCompleted: true,
  });

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

  const addRecipient = () => {
    if (recipients.length >= MAX_RECIPIENTS) return;
    setRecipients([
      ...recipients,
      {
        id: Math.random().toString(36).slice(2),
        email: "",
        alerts: { ...DEFAULT_ALERT_CONFIG },
      },
    ]);
  };

  const updateRecipient = (id: string, updated: Recipient) => {
    setRecipients(recipients.map((r) => (r.id === id ? updated : r)));
    if (emailErrors[id]) {
      const errs = { ...emailErrors };
      delete errs[id];
      setEmailErrors(errs);
    }
  };

  const removeRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id));
    const errs = { ...emailErrors };
    delete errs[id];
    setEmailErrors(errs);
  };

  const validateAndSave = () => {
    const errs: Record<string, string> = {};
    recipients.forEach((r) => {
      if (!r.email) errs[r.id] = "Email is required.";
      else if (!isValidEmail(r.email))
        errs[r.id] = "Please enter a valid email address.";
    });
    setEmailErrors(errs);
    if (Object.keys(errs).length === 0) alert("Settings saved!");
  };

  return (
    <div className="text-[#090814]">
      {/* ── Alert Settings section ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-[8px]">
          <h2 className="text-[20px] font-[500] text-[#090814] leading-[24px]">
            Alert Settings
          </h2>
          <p className="text-[13px] font-normal text-[#6B7280] leading-[16px]">
            Control which type of alerts to receive and add additional
            recipients when an event occurs within your fleet
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand" : "Collapse"}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-[8px] bg-white hover:bg-[#F9FAFB] transition-colors shrink-0"
        >
          <svg
            className={`w-[24px] h-[24px] text-[#5E54C5] transition-transform duration-200 ${
              collapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 15l6-6 6 6"
            />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Tabs */}
          <div className="inline-flex mb-5 h-8 rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab("my")}
              className={`w-[170px] flex items-center justify-center text-[13px] font-medium border-r transition ${
                activeTab === "my"
                  ? "bg-[#5E54C5] text-white border-[#6860C8]"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              My Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("additional")}
              className={`px-4 flex items-center text-[13px] font-medium transition ${
                activeTab === "additional"
                  ? "bg-[#5E54C5] text-white"
                  : "bg-white text-gray-600"
              }`}
            >
              Additional Recipients
            </button>
          </div>

          {/* My Alerts */}
          {activeTab === "my" && (
            <div className="max-w-lg">
              <AlertConfigSection
                config={myAlerts}
                onChange={(patch) => setMyAlerts({ ...myAlerts, ...patch })}
              />
            </div>
          )}

          {/* Additional Recipients */}
          {activeTab === "additional" && (
            <div className="max-w-lg">
              <p className="text-sm text-gray-500 mb-4">
                Add up to {MAX_RECIPIENTS} additional recipients and configure
                alerts for each user
              </p>

              {recipients.map((r) => (
                <RecipientCard
                  key={r.id}
                  recipient={r}
                  onChange={(updated) => updateRecipient(r.id, updated)}
                  onRemove={() => removeRecipient(r.id)}
                  emailError={emailErrors[r.id]}
                />
              ))}

              {recipients.length >= MAX_RECIPIENTS ? (
                <p className="text-xs text-amber-700 mb-4 py-1.5 px-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                    />
                  </svg>
                  Max number of recipients reached
                </p>
              ) : (
                <button
                  type="button"
                  onClick={addRecipient}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mb-4 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add recipient
                </button>
              )}

              {recipients.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={validateAndSave}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Divider ── */}
      <div className="my-6 h-px bg-[#E5E7EB]" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4" />

      <AlertGraph data={apiData.userConnections} interval={interval} />

      <div className="my-6 h-px bg-[#E5E7EB]" />

      {/* ── Alert History ── */}
      <div>
        <AlertHistorySection />
      </div>
    </div>
  );
}
