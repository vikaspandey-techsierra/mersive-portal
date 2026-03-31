"use client";
import { useRouter } from "next/navigation";

export function OrgSwitcher() {
  const router = useRouter();

  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => router.push("/org_1/home")}
        className="px-3 py-1 border rounded color-black"
      >
        Org 1
      </button>
      <button
        onClick={() => router.push("/org_2/home")}
        className="px-3 py-1 border rounded color-black"
      >
        Org 2
      </button>
      <button
        onClick={() => router.push("/GDeZNiL4IS3QrYdLQTf6-clney/home")}
        className="px-3 py-1 border rounded color-black"
      >
        Mock Org
      </button>
    </div>
  );
}
