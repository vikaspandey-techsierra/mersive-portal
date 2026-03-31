"use client";

import EmailAlertsPage from "@/components/analytics/email/page";
import MonitoringPage from "@/components/analytics/monitoring/page";
import UsagePage from "@/components/analytics/usage/page";
import Sidebar from "@/components/Sidebar";
import { useState, useRef } from "react";
import { Download } from "lucide-react";
import { SelectableDataTableHandle } from "@/lib/types/charts";

type Tab = "Usage" | "Monitoring" | "Email Alerts";

const SHOW_EXPORT_CSV =
  process.env.NEXT_PUBLIC_FEATURE_FLAG_SHOW_EXPORT_CSV_ON_EMAIL_TABLE ===
  "true"; // Toggle this to show/hide the alert graph section
const SHOW_ALERT_PAGE =
  process.env.NEXT_PUBLIC_FEATURE_FLAG_SHOW_ALERT_PAGE === "true"; // Toggle this to show/hide the alert graph section

const TABS: Tab[] = [
  "Usage",
  "Monitoring",
  ...(SHOW_ALERT_PAGE ? (["Email Alerts"] as Tab[]) : []),
];

export default function AnalyticsLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("Usage");

  const usageTableRef = useRef<SelectableDataTableHandle>(null);
  const monitoringTableRef = useRef<SelectableDataTableHandle>(null);

  const handleExportCSV = () => {
    if (activeTab === "Usage") {
      usageTableRef.current?.exportCSV();
    } else if (activeTab === "Monitoring") {
      monitoringTableRef.current?.exportCSV();
    }
  };
  const renderContent = () => {
    switch (activeTab) {
      case "Usage":
        return <UsagePage tableRef={usageTableRef} />;
      case "Monitoring":
        return <MonitoringPage tableRef={monitoringTableRef} />;
      case "Email Alerts":
        return SHOW_ALERT_PAGE ? <EmailAlertsPage /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-white p-8">
        <div className="">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#6860C8] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="8" width="3" height="7" rx="0.5" fill="#fff" />
                <rect x="6" y="4" width="3" height="11" rx="0.5" fill="#fff" />
                <rect x="11" y="1" width="3" height="14" rx="0.5" fill="#fff" />
              </svg>
            </div>
            <span className="text-lg font-bold text-black">Analytics</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-5">
            <div className="flex flex-wrap">
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm transition-all border-l-4 ${
                      isActive
                        ? "border-[#6860C8] font-semibold text-black"
                        : "border-transparent text-gray-400"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {(activeTab !== "Email Alerts" || SHOW_EXPORT_CSV) && (
              <button
                onClick={handleExportCSV}
                className="w-full sm:w-auto flex items-center gap-2 text-sm font-medium text-black border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
              >
                {" "}
                <Download size={16} /> Export to CSV{" "}
              </button>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="w-full min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
}
