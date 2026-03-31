"use client";

export default function PlanTypeSkeleton() {
  return (
    <div className="flex flex-col gap-6 items-center justify-between w-full ">
      <div className="flex items-center justify-between w-full ">
        {/* Left Pie Skeleton  */}
        <div className="w-55 h-55 rounded-full shrink-0 bg-[#E2E1E8] " />

        {/* Right Legend Skeleton */}
        <div className="space-y-6 w-[45%]">
          {[{ dot: "#E2E1E8" }, { dot: "#E2E1E8" }, { dot: "#E2E1E8" }].map(
            (item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: item.dot }}
                />
                <div
                  className="h-4 w-full rounded-md"
                  style={{ backgroundColor: "#E2E2EC" }}
                />
              </div>
            ),
          )}
        </div>
      </div>
      <h1 className="text-4 text-[#090814]">Add devices to see their status</h1>
    </div>
  );
}
