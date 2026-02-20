// components/UpdatesSection.tsx
"use client";

import React from "react";
import Link from "next/link";

interface UpdatesSectionProps {
  updates: {
    latest: Array<{
      version: string;
      releaseNotes: string[];
    }>;
    allReleaseNotesLink: string;
  };
}

export const UpdatesSection: React.FC<UpdatesSectionProps> = ({ updates }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Updates</h2>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Latest Updates</h3>
        {updates.latest.map((update, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-gray-900">{update.version}</h4>
            <ul className="mt-2 space-y-1 list-disc list-inside text-sm text-gray-600">
              {update.releaseNotes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-4">
          <Link
            href={updates.allReleaseNotesLink}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
          >
            See all release notes
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
      </div>
    </div>
  );
};
