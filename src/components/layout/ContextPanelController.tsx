"use client";

import { usePathname } from "next/navigation";
import NotesPanel from "@/components/notes/NotesPanel";
import FinancePanel from "@/components/finance/FinancePanel";
import HealthPanel from "@/components/health/HealthPanel";

export default function ContextPanelController() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard/notes")) return <NotesPanel />;
  if (pathname.startsWith("/dashboard/finance")) return <FinancePanel />;
  if (pathname.startsWith("/dashboard/health")) return <HealthPanel />;
  return null;
}
