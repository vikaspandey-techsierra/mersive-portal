"use client";

import { useMemo, useState } from "react";
import { deviceEvents } from "@/lib/analyticsData";
import FiltersBar from "@/components/FiltersBar";
import DeviceUtilizationChart from "@/components/DeviceUtilizationChart";
import UserConnectionsChart from "@/components/UserConnectionsChartEg";
import CollaborationChart from "@/components/CollaborationChart";

export default function AnalyticsGraphPage() {
  const [protocol, setProtocol] = useState("ALL");
  const [os, setOs] = useState("ALL");
  const [conference, setConference] = useState("ALL");

  const filtered = useMemo(() => {
    return deviceEvents.filter(
      (e) =>
        (protocol === "ALL" || e.protocol === protocol) &&
        (os === "ALL" || e.os === os) &&
        (conference === "ALL" || e.conference === conference),
    );
  }, [protocol, os, conference]);

  const utilizationData = useMemo(() => {
    const map: any = {};
    filtered.forEach((e) => {
      if (!map[e.day]) map[e.day] = new Set();
      map[e.day].add(e.meetingId);
    });

    return Object.keys(map).map((day) => ({
      day,
      meetings: map[day].size,
      connections: filtered.filter((f) => f.day === day).length,
    }));
  }, [filtered]);

  const protocolData = useMemo(() => {
    const days = [...new Set(filtered.map((f) => f.day))];
    return days.map((day) => {
      const d = filtered.filter((f) => f.day === day);
      const row: any = { day };
      ["Web", "AirPlay", "Miracast", "Google Cast", "HDMI"].forEach((p) => {
        row[p] = d.filter((x) => x.protocol === p).length;
      });
      return row;
    });
  }, [filtered]);

  const collaborationData = useMemo(() => {
    const days = [...new Set(filtered.map((f) => f.day))];
    return days.map((day) => {
      const d = filtered.filter((f) => f.day === day);
      const meetings = new Set(d.map((x) => x.meetingId)).size;
      return {
        day,
        avgConnections: d.length / meetings,
        avgPosts: d.reduce((a, b) => a + b.posts, 0) / meetings,
      };
    });
  }, [filtered]);

  return (
    <main className="p-8 space-y-6 bg-gray-100 min-h-screen w-[95vw]">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      <FiltersBar
        protocol={protocol}
        os={os}
        conference={conference}
        setProtocol={setProtocol}
        setOs={setOs}
        setConference={setConference}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DeviceUtilizationChart data={utilizationData} />
        <UserConnectionsChart data={protocolData} />
        <CollaborationChart data={collaborationData} />
      </div>
    </main>
  );
}
