// components/FleetHealthCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { FleetHealth } from "@/types/dashboard.types";

interface FleetHealthCardProps {
  health: FleetHealth;
}

export const FleetHealthCard: React.FC<FleetHealthCardProps> = ({ health }) => {
  const getHealthColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Overall Fleet Health
      </h3>
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative">
          <div
            className={`text-7xl font-bold ${getHealthColor(health.healthScore)}`}
          >
            {health.healthScore}
          </div>
          <div className="text-sm text-gray-500 text-center mt-2">
            out of 10
          </div>
        </div>

        {/* Health Score Gauge */}
        <div className="w-full max-w-xs mt-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getHealthColor(health.healthScore)}`}
              style={{ width: `${(health.healthScore / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Devices with Issues Link */}
        {health.devicesWithIssues && (
          <div className="mt-6">
            <Link
              href="/devices/issues"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
            >
              Show devices with issues
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
