"use client";

import { useMemo, useState } from "react";
import VotingFilters from "@/components/VotingFilters";
import VotingPieChart from "@/components/VotingPieChart";
import { voters } from "@/lib/votingDynamicData";

export default function VotingDashboard() {
  const [state, setState] = useState("ALL");
  const [ageGroup, setAgeGroup] = useState("ALL");
  const [caste, setCaste] = useState("ALL");

  const filteredData = useMemo(() => {
    return voters.filter(
      (v) =>
        (state === "ALL" || v.state === state) &&
        (ageGroup === "ALL" || v.ageGroup === ageGroup) &&
        (caste === "ALL" || v.caste === caste),
    );
  }, [state, ageGroup, caste]);

  const partyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach((v) => {
      map[v.party] = (map[v.party] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  return (
    <main className="p-8 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold">India Voting Analytics</h1>

      <VotingFilters
        state={state}
        ageGroup={ageGroup}
        caste={caste}
        setState={setState}
        setAgeGroup={setAgeGroup}
        setCaste={setCaste}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VotingPieChart data={partyData} />
      </div>
    </main>
  );
}
