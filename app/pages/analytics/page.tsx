"use client";

import EmailAlertsPage from "@/components/analytics/email/page";
import MonitoringPage from "@/components/analytics/monitoring/page";
import UsagePage from "@/components/analytics/usage/page";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

type Tab = "Usage" | "Monitoring" | "Email Alerts";

const TABS: Tab[] = ["Usage", "Monitoring", "Email Alerts"];

export default function AnalyticsLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("Usage");

  const renderContent = () => {
    switch (activeTab) {
      case "Usage":
        return <UsagePage />;
      case "Monitoring":
        return <MonitoringPage />;
      case "Email Alerts":
        return <EmailAlertsPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1">
        <div className="px-6 pt-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-[#6860C8] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="8" width="3" height="7" rx="0.5" fill="#fff" />
                <rect x="6" y="4" width="3" height="11" rx="0.5" fill="#fff" />
                <rect x="11" y="1" width="3" height="14" rx="0.5" fill="#fff" />
              </svg>
            </div>
            <span className="text-lg font-bold text-black">
              Analytics
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex">
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

            <button className="flex items-center gap-2 text-sm font-medium text-black border border-gray-300 rounded-lg px-3 py-1.5 mb-1 hover:bg-gray-50 transition">
              Export to CSV
            </button>
          </div>
        </div>

        <div className="px-6 py-6">{renderContent()}</div>
      </div>
    </div>
  );
}