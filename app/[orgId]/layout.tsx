"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { clearMetricsByOrg } from "@/lib/analytics/utils/metricsStore";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const orgId = params?.orgId as string | undefined;
  const [selectedOrg, setSelectedOrg] = useState(orgId ?? "org_1");

  useEffect(() => {
    if (!orgId) {
      router.replace("/org_1/home");
      return;
    }

    setSelectedOrg(orgId);
    clearMetricsByOrg(orgId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  const handleOrgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrg = e.target.value;
    setSelectedOrg(newOrg);

    if (pathname.includes("/analytics")) {
      router.push(`/${newOrg}/analytics`);
    } else {
      router.push(`/${newOrg}/home`);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b flex items-center px-6">
          <select
            value={selectedOrg}
            onChange={handleOrgChange}
            className="border border-gray-300 px-3 py-1 rounded font-bold text-black bg-white"
          >
            <option value="org_1">Org 1</option>
            <option value="org_2">Org 2</option>
            <option value="GDeZNiL4IS3QrYdLQTf6-clney">Mock Org</option>
          </select>
        </div>

        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
