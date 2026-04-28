"use client";

import { useState } from "react";
import { Activity, FileText, Wallet, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const topNav = [
  { icon: LayoutDashboard, label: "홈", href: "/dashboard", exact: true },
  { icon: FileText, label: "메모", href: "/dashboard/notes" },
  { icon: Wallet, label: "돈", href: "/dashboard/finance" },
  { icon: Activity, label: "건강", href: "/dashboard/health" },
];

const bottomNav = [
  { icon: User, label: "프로필", href: "/dashboard/profile" },
  { icon: Settings, label: "설정", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className="relative h-screen w-14 shrink-0"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div
        className={`absolute left-0 top-0 z-50 flex h-full flex-col overflow-hidden border-r border-zinc-100 bg-white py-4 transition-all duration-200 ${
          expanded ? "w-52" : "w-14"
        }`}
      >
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {topNav.map(({ icon: Icon, label, href, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex h-10 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-zinc-100 ${
                isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
              }`}
            >
              <Icon size={20} strokeWidth={1.5} className="shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap text-sm transition-all duration-200 ${
                  expanded ? "w-auto opacity-100" : "w-0 opacity-0"
                } ${isActive ? "font-medium text-zinc-900" : "text-zinc-500"}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 px-2">
        {bottomNav.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            className={`flex h-10 items-center gap-3 rounded-lg px-2 transition-colors hover:bg-zinc-100 ${
              pathname.startsWith(href) ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
            }`}
          >
            <Icon size={20} strokeWidth={1.5} className="shrink-0" />
            <span
              className={`overflow-hidden whitespace-nowrap text-sm transition-all duration-200 ${
                expanded ? "w-auto opacity-100" : "w-0 opacity-0"
              } ${pathname.startsWith(href) ? "font-medium text-zinc-900" : "text-zinc-500"}`}
            >
              {label}
            </span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex h-10 items-center gap-3 rounded-lg px-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-400"
        >
          <LogOut size={20} strokeWidth={1.5} className="shrink-0" />
          <span
            className={`overflow-hidden whitespace-nowrap text-sm transition-all duration-200 ${
              expanded ? "w-auto opacity-100" : "w-0 opacity-0"
            } text-zinc-500`}
          >
            로그아웃
          </span>
        </button>
      </div>
      </div>
    </aside>
  );
}
