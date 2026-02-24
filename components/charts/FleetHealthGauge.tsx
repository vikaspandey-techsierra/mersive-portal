"use client";

interface Props {
  score: number;
  onlineDevices: number;
  devicesWithIssues: number;
}

export default function FleetHealthGauge({
  score,
  onlineDevices,
  devicesWithIssues,
}: Props) {
  const percentage = (score / 10) * 100;

  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="text-sm font-semibold mb-4">Overall Fleet Health</h3>

      <div className="flex items-center gap-6">
        {/* Gauge */}
        <div className="relative w-40 h-20 bg-gray-200 rounded-t-full overflow-hidden">
          <div
            className="absolute bottom-0 left-0 h-full bg-green-500"
            style={{ width: `${percentage}%` }}
          />

          <div className="absolute inset-0 flex items-center justify-center top-6">
            <span className="text-xl font-bold">{score}</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-sm space-y-1">
          <div>
            Online devices:{" "}
            <span className="font-semibold">{onlineDevices}</span>
          </div>

          <div>
            Devices with issues:{" "}
            <span className="text-red-500 font-semibold">
              {devicesWithIssues}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
