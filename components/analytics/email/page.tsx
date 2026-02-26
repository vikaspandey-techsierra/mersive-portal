"use client";

import { useState } from "react";
import { AnalyticsApiResponse, DAY_COUNTS, generateMockData, isValidEmail, tickInterval } from "@/lib/homePage";
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
    recipients: "itsupport@mersive.com, jflores@mersive.com, rkumar@mersive.com",
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
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
        checked ? "bg-indigo-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
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
    <div className="flex items-center gap-3 py-2">
      <Toggle checked={checked} onChange={onChange} />
      <span className="text-sm text-gray-700 flex items-center gap-2 flex-wrap">
        {showMinutes ? (
          <>
            <span>Email when a Pod is unreachable for</span>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden h-7">
              <input
                type="number"
                min={1}
                max={60}
                value={minutes ?? 5}
                onChange={(e) => onMinutesChange?.(Number(e.target.value))}
                className="w-10 px-1 text-sm text-center focus:outline-none"
              />
              <div className="flex flex-col border-l border-gray-300 h-full">
                <button
                  type="button"
                  onClick={() => onMinutesChange?.(Math.min(60, (minutes ?? 5) + 1))}
                  className="flex-1 px-1 text-gray-400 hover:text-gray-700 text-[9px] flex items-center justify-center"
                >▲</button>
                <button
                  type="button"
                  onClick={() => onMinutesChange?.(Math.max(1, (minutes ?? 5) - 1))}
                  className="flex-1 px-1 text-gray-400 hover:text-gray-700 text-[9px] flex items-center justify-center border-t border-gray-300"
                >▼</button>
              </div>
            </div>
            <span>minutes</span>
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
    <div className="border border-gray-200 rounded-lg p-4 mb-3 bg-white">
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
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
          <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {emailError}
        </p>
      ) : (
        <p className="text-xs text-gray-400 mt-1">Separate multiple email addresses with a comma</p>
      )}

      <div className="mt-2">
        <AlertConfigSection
          config={recipient.alerts}
          onChange={(patch) =>
            onChange({ ...recipient, alerts: { ...recipient.alerts, ...patch } })
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
    <span className="inline-flex flex-col ml-1 align-middle">
      <svg className={`w-2.5 h-2.5 -mb-0.5 ${active && dir === "asc" ? "text-indigo-600" : "text-gray-300"}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 0L10 6H0L5 0Z" />
      </svg>
      <svg className={`w-2.5 h-2.5 ${active && dir === "desc" ? "text-indigo-600" : "text-gray-300"}`} viewBox="0 0 10 6" fill="currentColor">
        <path d="M5 6L0 0H10L5 6Z" />
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
      className="text-left text-xs font-medium text-gray-500 py-3 pr-4 first:pl-4 cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      {label}
      <SortArrows active={sortField === field} dir={sortDir} />
    </th>
  );
}

function AlertHistorySection() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("my");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
    <div>
      {/* Controls row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44"
            />
          </div>

          {/* Filter toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm">
            <button
              type="button"
              onClick={() => setFilter("my")}
              className={`px-3 py-1.5 font-medium transition-colors ${
                filter === "my" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              My alerts
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-gray-200 ${
                filter === "all" ? "bg-indigo-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              All alerts
            </button>
          </div>
        </div>

        {/* Export */}
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" />
          </svg>
          Export to CSV
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto bg-white">
        <table className="w-full text-sm min-w-160">
          <thead className="border-b border-gray-200">
            <tr>
              <Th label="Date" field="date" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
              <Th label="Name" field="name" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
              <Th label="ID" field="id" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
              <Th label="Description" field="description" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
              <Th label="Recipients" field="recipients" sortField={sortField} sortDir={sortDir} handleSort={handleSort} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-8">
                  No alerts found
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pl-4 pr-4 text-gray-700 whitespace-nowrap">
                    <span>{row.date}</span>
                    <span className="text-gray-400 text-xs"> · {row.timeAgo}</span>
                  </td>
                  <td className="py-3 pr-4 text-gray-700">{row.name}</td>
                  <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{row.id}</td>
                  <td className="py-3 pr-4 text-gray-700">{row.description}</td>
                  <td className="py-3 pr-4 text-gray-500 text-xs">{row.recipients}</td>
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
      { id: Math.random().toString(36).slice(2), email: "", alerts: { ...DEFAULT_ALERT_CONFIG } },
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
      else if (!isValidEmail(r.email)) errs[r.id] = "Please enter a valid email address.";
    });
    setEmailErrors(errs);
    if (Object.keys(errs).length === 0) alert("Settings saved!");
  };

  return (
    <div className="px-8 text-[#090814]">

      {/* ── Alert Settings section ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Alert Settings</h2>
          <p className="text-xs text-gray-500 mt-0.5 max-w-md">
            Control which type of alerts to receive and add additional recipients when an event occurs within your fleet
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-1.5 border border-gray-200 rounded bg-white hover:bg-gray-50 transition-colors ml-4 shrink-0"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Tabs */}
          <div className="flex mb-5 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("my")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "my" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              My Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("additional")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === "additional" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
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
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => alert("Settings saved!")}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Additional Recipients */}
          {activeTab === "additional" && (
            <div className="max-w-lg">
              <p className="text-sm text-gray-500 mb-4">
                Add up to {MAX_RECIPIENTS} additional recipients and configure alerts for each user
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
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  Max number of recipients reached
                </p>
              ) : (
                <button
                  type="button"
                  onClick={addRecipient}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mb-4 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
      <hr className="my-8 border-gray-200" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* <span className="text-xl font-bold text-black">Usage</span> */}

        {/* <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeRange(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                timeRange === key
                  ? "bg-[#6860C8] text-white border-[#6860C8]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div> */}
      </div>

       <AlertGraph data={apiData.userConnections} interval={interval} />

      {/* ── Alert History ── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Alert History</h2>
        <p className="text-xs text-gray-500 mt-0.5 mb-4">
          View the quantity and which types of alerts were emailed to users
        </p>
        <AlertHistorySection />
      </div>
    </div>
  );
}