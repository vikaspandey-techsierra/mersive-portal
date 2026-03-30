"use client";

import EmailAlertsPage from "@/components/analytics/email/page";
import MonitoringPage from "@/components/analytics/monitoring/page";
import UsagePage from "@/components/analytics/usage/page";
import Sidebar from "@/components/Sidebar";
import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { SelectableDataTableHandle } from "@/lib/types/charts";
import { useParams } from "next/navigation";
import { clearMetricsByOrg } from "@/lib/analytics/utils/metricsStore";

type Tab = "Usage" | "Monitoring" | "Email Alerts";

const SHOW_EXPORT_CSV =
  process.env.NEXT_PUBLIC_FEATURE_FLAG_SHOW_EXPORT_CSV_ON_EMAIL_TABLE ===
  "true";

const SHOW_ALERT_PAGE =
  process.env.NEXT_PUBLIC_FEATURE_FLAG_SHOW_ALERT_PAGE === "true";

const TABS: Tab[] = [
  "Usage",
  "Monitoring",
  ...(SHOW_ALERT_PAGE ? (["Email Alerts"] as Tab[]) : []),
];

export default function AnalyticsLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("Usage");

  const params = useParams();
  const orgId = params.orgId as string;

  const usageTableRef = useRef<SelectableDataTableHandle>(null);
  const monitoringTableRef = useRef<SelectableDataTableHandle>(null);

  // Clear cache when org changes
  useEffect(() => {
    if (orgId) {
      clearMetricsByOrg(orgId);
    }
  }, [orgId]);

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
        return <UsagePage tableRef={usageTableRef} orgId={orgId} />;

      case "Monitoring":
        return <MonitoringPage tableRef={monitoringTableRef} orgId={orgId} />;

      case "Email Alerts":
        return SHOW_ALERT_PAGE ? <EmailAlertsPage orgId={orgId} /> : null;

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white overflow-x-hidden">
      <Sidebar />

      <div className="flex-1 min-w-0 bg-white p-8">
        <div className="text-sm text-gray-500 mb-2">
          Current Org: <strong>{orgId}</strong>
        </div>

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

        {/* Tabs + Export */}
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
              <Download size={16} /> Export to CSV
            </button>
          )}
        </div>

        {/* Page Content */}
        <div className="w-full min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
}
