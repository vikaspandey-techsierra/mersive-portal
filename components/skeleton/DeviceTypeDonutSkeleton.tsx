"use client";

export default function DeviceTypeDonutSkeleton() {
  return (
    <div className="flex items-center justify-between w-full animate-pulse">
      
      {/* Donut Skeleton */}
      <div className="relative w-55 h-55 flex items-center justify-center">
        {/* Outer ring */}
        <div className="w-55 h-55 rounded-full border-30 border-gray-200" />
        
        {/* Center text blocks */}
        <div className="absolute flex flex-col items-center gap-3">
          <div className="w-28 h-4 bg-gray-200 rounded-md" />
          <div className="w-16 h-6 bg-gray-200 rounded-md" />
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
  );
}