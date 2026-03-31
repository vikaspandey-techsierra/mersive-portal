"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-white text-black">
      <div className="bg-white border rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center flex flex-col gap-6">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          📊 Analytics Dashboard
        </h1>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/org_1/home")}
            // onClick={() => router.push("/org_1/analytics")}
            className="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg text-white"
          >
            ORG 1
          </button>

          <button
            onClick={() => router.push("/org_2/home")}
            // onClick={() => router.push("/org_2/analytics")}
            className="bg-gray-800 hover:bg-gray-900 px-6 py-3 rounded-lg text-white"
          >
            ORG 2
          </button>

          <button
            onClick={() => router.push("/GDeZNiL4IS3QrYdLQTf6-clney/home")}
            // onClick={() => router.push("/GDeZNiL4IS3QrYdLQTf6-clney/home")}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white"
          >
            MOCK ORG
          </button>
        </div>
      </div>
    </main>
  );
}
