"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/pages/dashboard" },
    { name: "Analytics", href: "/pages/analytics" },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 min-h-screen bg-gray-50 border-r border-gray-200 p-4 shrink-0">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-[#6860C8] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}