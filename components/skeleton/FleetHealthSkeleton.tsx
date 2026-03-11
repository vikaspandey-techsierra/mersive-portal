"use client";

export default function FleetHealthSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        gap: 16,
      }}
      className="animate-pulse"
    >
      {/* Top row: Gauge + Legend side by side */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: 24 }}>

        {/* Gauge */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ width: 300, height: 150, position: "relative", overflow: "hidden" }}>
            <div
              style={{
                width: 300,
                height: 300,
                borderRadius: "50%",
                position: "absolute",
                top: 0,
                left: 0,
                background: "conic-gradient(#B0AECA 0deg 90deg, #E2E0EE 90deg 360deg)",
                WebkitMaskImage: "radial-gradient(circle, transparent 95px, black 96px)",
                maskImage: "radial-gradient(circle, transparent 95px, black 96px)",
              }}
            />
            {/* Center text labels */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ width: 100, height: 13, borderRadius: 6, backgroundColor: "#E2E2EC" }} />
              <div style={{ width: 60, height: 13, borderRadius: 6, backgroundColor: "#E2E2EC" }} />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
          {["#B0AECA", "#C8C6DC", "#E2E0EE"].map((color, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: color,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  height: 14,
                  flex: 1,
                  borderRadius: 999,
                  backgroundColor: "#E2E2EC",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom button — outside top row, centered */}
      <div
        style={{
          width: 300,
          height: 44,
          borderRadius: 12,
          backgroundColor: "#E8E8F0",
        }}
      />

    </div>
  );
}