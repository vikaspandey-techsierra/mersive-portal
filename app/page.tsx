"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-white text-black">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          📊 Analytics Dashboard
        </h1>
        <button
          onClick={() => router.push("/pages/user-connections")}
          className="bg-violet-600 hover:bg-violet-700 transition-all duration-300 px-6 py-3 rounded-lg font-medium shadow-lg hover:scale-105 active:scale-95 text-white"
        >
          View Dashboard →
        </button>
      </div>
    </main>
  );
}
