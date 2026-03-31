"use client";

import { ExternalLinkIcon } from "lucide-react";

export default function FleetHealthGaugeEmptyState() {
  return (
    <div className="flex flex-col items-center w-full gap-6 text-[16px] text-[#090814]">
      {/* Top row */}
      <div className="flex items-center justify-between w-full gap-8">
        {/* Gauge */}
        <div className="shrink-0">
          <div className="relative w-75 h-37.5 overflow-hidden">
            {/* Arc */}
            <div
              className="
                absolute top-0 left-0
                w-75 h-75 rounded-full  
                [background:conic-gradient(#E2E1E8_0deg_120deg,#E2E0EE_120deg_360deg)]
                mask-[radial-gradient(circle,transparent_95px,black_96px)]
                [-webkit-mask-image:radial-gradient(circle,transparent_95px,black_96px)]
              "
            />

            {/* Center text */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
              <span className="text-[16px] ">Health Score</span>
              <div className="w-6 h-1.5 bg-[#090814]" />
            </div>
          </div>
        </div>

        {/* Right side info */}
        <div className="flex flex-col gap-4 min-w-45">
          {/* Online devices */}
          <div className="flex items-center justify-between gap-6">
            <span>Online devices</span>
            <span className="text-lg">-</span>
          </div>

          {/* Devices with issues */}
          <div className="flex items-center justify-between gap-6">
            <span>Devices with issues</span>
            <span className="text-lg">-</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="w-75 h-11 rounded-xl border border-[#E8E8F0] text-[#8e8e91] flex items-center justify-center gap-2">
        <span>Show devices with issues</span>
        <ExternalLinkIcon size={12} className="ml-1" />
      </div>
    </div>
  );
}
