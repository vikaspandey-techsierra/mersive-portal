"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { orgId } = useParams<{ orgId: string }>();

  const navItems = [
    { name: "Home", path: "home" },
    { name: "Analytics", path: "analytics" },
  ];

  return (
    <aside className="w-60 min-h-screen bg-gray-50 border-r border-gray-200 p-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const href = `/${orgId}/${item.path}`;
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={item.name}
              href={href}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
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
