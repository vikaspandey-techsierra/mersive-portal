"use client";

export default function FleetHealthSkeleton() {
  return (
    <div className="flex flex-col items-center w-full gap-5 animate-pulse">
      {/* Top row */}
      <div className="flex items-center justify-between w-full gap-8">
        {/* Gauge */}
        <div className="shrink-0">
          <div className="relative w-75 h-37.5 overflow-hidden">
            {/* Arc */}
            <div
              className="
                absolute top-0 left-0
                w-75 h-75rounded-full
                [background:conic-gradient(#B0AECA_0deg_120deg,#E2E0EE_120deg_360deg)]
                [mask-[radial-gradient(circle,transparent_95px,black_96px)]
                [-webkit-mask-image:radial-gradient(circle,transparent_95px,black_96px)]
              "
            />

            {/* Center text */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
              <span className="text-sm text-gray-500">Health Score</span>
              <div className="w-6 h-2 rounded bg-gray-300" />
            </div>
          </div>
        </div>

        {/* Right side info */}
        <div className="flex flex-col gap-4 min-w-45]">
          {/* Online devices */}
          <div className="flex items-center justify-between gap-6">
            <span className="text-sm text-gray-600">Online devices</span>
            <span className="text-lg text-gray-500">-</span>
          </div>

          {/* Devices with issues */}
          <div className="flex items-center justify-between gap-6">
            <span className="text-sm text-gray-600">Devices with issues</span>
            <span className="text-lg text-gray-500">-</span>
          </div>
        </div>
      </div>

      {/* Button */}
      <div className="w-75 h-11 rounded-xl bg-[#E8E8F0] flex items-center justify-center gap-2">
        <span className="text-sm text-gray-500">Show devices with issues</span>
        <div className="w-3 h-3 border-2 border-gray-400 rounded-sm" />
      </div>
    </div>
  );
}
