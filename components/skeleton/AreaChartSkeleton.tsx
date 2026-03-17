"use client";

interface Props {
  title: string;
  description?: string;
}

export default function AreaChartSkeleton({ title, description }: Props) {
  return (
    <div className="w-full mb-10">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {/* Chart container */}
      <div className="animate-pulse border border-[#ECECF4] rounded-xl p-6 mt-4 bg-white">
        {/* SVG Chart */}
        <div className="relative w-full h-80">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1500 360"
            preserveAspectRatio="none"
            className="absolute top-0 left-0"
          >
            {/* Grid lines */}
            {[20, 80, 140, 200, 260, 320].map((y) => (
              <line
                key={y}
                x1="70"
                y1={y}
                x2="1500"
                y2={y}
                stroke="#ECECF4"
                strokeWidth="1.5"
              />
            ))}

            {/* Y-axis labels */}
            {[20, 80, 140, 200, 260, 320].map((y) => (
              <rect
                key={y}
                x="0"
                y={y - 7}
                width="44"
                height="14"
                rx="4"
                fill="#E2E2EC"
              />
            ))}

            {/* Light area */}
            <polygon
              points="70,340 70,260 280,240 500,280 720,160 940,290 1160,170 1380,120 1500,130 1500,340"
              fill="#EEEDF4"
              opacity="0.95"
            />

            {/* Mid area */}
            <polygon
              points="70,340 70,275 280,258 500,298 720,185 940,308 1160,195 1380,148 1500,158 1500,340"
              fill="#D8D4E8"
              opacity="0.85"
            />

            {/* Dark area */}
            <polygon
              points="70,340 70,295 280,282 500,318 720,218 940,328 1160,228 1380,190 1500,200 1500,340"
              fill="#B8B4CC"
              opacity="0.75"
            />

            {/* X-axis labels */}
            {[130, 345, 560, 775, 990, 1205, 1420].map((x, i) => (
              <rect
                key={i}
                x={x - 40}
                y="344"
                width="70"
                height="14"
                rx="4"
                fill="#E2E2EC"
              />
            ))}
          </svg>
        </div>

        {/* Bottom legend row */}
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <div className="w-36 h-6 rounded-lg bg-[#EEEDF4]" />
          {[
            { box: "#B8B4CC", bar: "#DDD9E8" },
            { box: "#B8B4CC", bar: "#DDD9E8" },
            { box: "#C8C4D8", bar: "#E2E0EE" },
            { box: "#C8C4D8", bar: "#E2E0EE" },
            { box: "#D0CEDE", bar: "#E8E6F0" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 shrink-0 rounded-sm"
                style={{ backgroundColor: item.box }}
              />
              <div
                className="h-5 w-15 rounded-sm"
                style={{ backgroundColor: item.bar }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
