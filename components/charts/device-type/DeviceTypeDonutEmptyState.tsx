"use client";

export default function DeviceTypeDonutEmptyState() {
  return (
    <div className="flex flex-col gap-6 items-center justify-between w-full ">
      <div className="flex items-center justify-between w-full  ">
        {/* Donut Skeleton */}
        <div className="relative w-55 h-55 flex items-center justify-center">
          {/* Outer ring */}
          <div className="w-55 h-55 rounded-full border-40 border-[#E2E1E8]" />

          {/* Center text blocks */}
          <div className="absolute flex flex-col items-center gap-2 pt-4">
            {/* <div className="w-28 h-4 bg-gray-200 rounded-md" />
          <div className="w-16 h-6 bg-gray-200 rounded-md" /> */}
            <h1 className="text-4 text-[#090814]">Total Devices</h1>
            <h2 className="text-[34px] font-semibold text-[#090814]">0</h2>
          </div>
        </div>

        {/* Right side legend skeleton */}
        <div className="ml-8 space-y-6 w-1/2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4">
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
              <div className="flex-1 h-4 bg-gray-200 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <h1 className="text-4 text-[#090814]">No devices have been added yet</h1>
    </div>
  );
}
