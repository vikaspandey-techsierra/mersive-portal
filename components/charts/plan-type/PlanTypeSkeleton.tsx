"use client";

export default function PlanTypeSkeleton() {
  return (
    <div className="flex items-center justify-between w-full animate-pulse">
      {/* Left Pie Skeleton  */}
      <div
        className="w-55 h-55 rounded-full shrink-0"
        style={{
          background:
            "conic-gradient(#A8A4BC 0% 20%, #DDD9E8 20% 65%, #EEEDF4 65% 100%)",
        }}
      />

      {/* Right Legend Skeleton */}
      <div className="space-y-6 w-[45%]">
        {[
          { dot: "#A8A4BC" }, // dark segment
          { dot: "#DDD9E8" }, // medium segment
          { dot: "#EEEDF4" }, // light segment
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: item.dot }}
            />
            <div className="h-4 w-full rounded-md bg-[#E2E2EC]" />
          </div>
        ))}
      </div>
    </div>
  );
}
