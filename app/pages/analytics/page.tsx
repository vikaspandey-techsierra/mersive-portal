"use client";

import EmailAlertsPage from "@/components/analytics/email/page";
import MonitoringPage from "@/components/analytics/monitoring/page";
import UsagePage from "@/components/analytics/usage/page";
import { useState } from "react";


// TAB CONFIG
type Tab = "Usage" | "Monitoring" | "Email Alerts";

const TABS: Tab[] = ["Usage", "Monitoring", "Email Alerts"];

// LAYOUT
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
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#fff" }}>

      {/* Global style — removes blue focus outlines */}
      <style>{`
        *:focus                 { outline: none !important; }
        *:focus-visible         { outline: none !important; }
        button:focus            { outline: none !important; box-shadow: none !important; }
        div:focus               { outline: none !important; }
        select:focus            { outline: none !important; box-shadow: none !important; }
        .recharts-wrapper:focus { outline: none !important; }
        svg:focus               { outline: none !important; }
        a:focus                 { outline: none !important; }
      `}</style>

      {/*  Header */}
      <div style={{ padding: "20px 24px 0" }}>

        {/* Icon + Analytics title */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: "#6860C8",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1"  y="8" width="3" height="7"  rx="0.5" fill="#fff" />
              <rect x="6"  y="4" width="3" height="11" rx="0.5" fill="#fff" />
              <rect x="11" y="1" width="3" height="14" rx="0.5" fill="#fff" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#000" }}>Analytics</span>
        </div>

        {/* Tabs + Export CSV */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* Tab buttons — state driven, no routing */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: "none",
                    border: "none",
                    borderLeft: isActive ? "3px solid #6860C8" : "3px solid transparent",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 400,
                    padding: "8px 16px",
                    color: isActive ? "#000" : "#888",
                    cursor: "pointer",
                    outline: "none",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Export to CSV */}
          <button
            style={{
              background: "#fff",
              border: "1px solid #d0d0d0",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 13,
              cursor: "pointer",
              outline: "none",
              fontWeight: 500,
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 4,
              fontFamily: "inherit",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 1v8M3.5 6.5l3 3 3-3M1 11h11"
                stroke="#333"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Export to CSV
          </button>
        </div>
      </div>

      {/* Active tab content */}
      <div style={{ padding: "24px", maxWidth: "100%", margin: "0 auto" }}>
        {renderContent()}
      </div>
    </div>
  );
}