"use client";

import { Activity, FileText, Wallet, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const topNav = [
  { icon: Activity, label: "건강", href: "/dashboard/health" },
  { icon: FileText, label: "메모", href: "/dashboard/notes" },
  { icon: Wallet, label: "돈", href: "/dashboard/finance" },
];

const bottomNav = [
  { icon: User, label: "프로필", href: "/dashboard/profile" },
  { icon: Settings, label: "설정", href: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-14 shrink-0 flex-col items-center border-r border-zinc-100 bg-white py-4">
      <nav className="flex flex-1 flex-col items-center gap-1">
        {topNav.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={`flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 ${
              pathname.startsWith(href) ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
          </Link>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-1">
        {bottomNav.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className={`flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-zinc-100 ${
              pathname.startsWith(href) ? "bg-zinc-100 text-zinc-900" : "text-zinc-400"
            }`}
          >
            <Icon size={20} strokeWidth={1.5} />
          </Link>
        ))}
        <button
          onClick={handleLogout}
          title="로그아웃"
          className="flex size-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-400"
        >
          <LogOut size={20} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}
