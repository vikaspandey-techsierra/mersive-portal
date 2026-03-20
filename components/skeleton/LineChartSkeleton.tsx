"use client";

interface Props {
  title: string;
  description?: string;
}

export default function LineChartSkeleton({ title, description }: Props) {
  const darkPoints =
    "60,270 180,245 300,292 420,255 540,272 660,285 780,275 900,288 1020,238 1140,282 1260,290 1380,250";
  const lightPoints =
    "60,270 180,230 300,160 420,235 540,185 660,160 780,245 900,145 1020,200 1140,130 1260,200 1380,165";

  const darkDots = darkPoints.split(" ").map((p) => p.split(",").map(Number));
  const lightDots = lightPoints.split(" ").map((p) => p.split(",").map(Number));

  return (
    <div className="w-full mb-10">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
      {/* Chart container */}
      <div className="animate-pulse border border-[#ECECF4] rounded-xl p-6 mt-2 bg-white">
        <div className="relative w-full h-85">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 380"
            preserveAspectRatio="none"
            className="absolute top-0 left-0"
          >
            {/* Grid lines — evenly spaced full height */}
            {[20, 90, 160, 230, 300].map((y) => (
              <line
                key={y}
                x1="60"
                y1={y}
                x2="1440"
                y2={y}
                stroke="#ECECF4"
                strokeWidth="1"
              />
            ))}

            {/* Y-axis labels — on each grid line */}
            {[20, 90, 160, 230, 300].map((y) => (
              <rect
                key={y}
                x="0"
                y={y - 7}
                width="40"
                height="12"
                rx="4"
                fill="#E2E2EC"
              />
            ))}

            {/* Lines */}
            <polyline
              points={darkPoints}
              fill="none"
              stroke="#A8A4BC"
              strokeWidth="2"
            />
            <polyline
              points={lightPoints}
              fill="none"
              stroke="#C8C4D8"
              strokeWidth="2"
            />

            {/* Dots */}
            {darkDots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="6" fill="#A8A4BC" />
            ))}
            {lightDots.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="6" fill="#C8C4D8" />
            ))}

            {/* X-axis labels  */}
            {[60, 280, 500, 720, 940, 1160, 1380].map((x, i) => (
              <rect
                key={i}
                x={x - 28}
                y="330"
                width="50"
                height="12"
                rx="3"
                fill="#E2E2EC"
              />
            ))}
          </svg>
        </div>

        {/* Bottom buttons  */}
        <div className="flex gap-3 mt-2">
          <div className="w-44 h-8 rounded-md bg-[#EEEDF4]" />
          <div className="w-44 h-8 rounded-md bg-[#B0AECA]" />
        </div>
      </div>
    </div>
  );
}
