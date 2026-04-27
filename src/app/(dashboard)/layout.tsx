import type { ReactNode } from "react";
import { headers } from "next/headers";
import Sidebar from "@/components/layout/Sidebar";
import NotesPanel from "@/components/notes/NotesPanel";
import FinancePanel from "@/components/finance/FinancePanel";
import HealthPanel from "@/components/health/HealthPanel";
import { createClient } from "@/lib/supabase/server";
import type { NoteWithCategory, Category } from "@/types";

async function getNotesData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { categories: [], notes: [] };

  let { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (!categories || categories.length === 0) {
    const { data: created } = await supabase
      .from("categories")
      .insert({ name: "일반", user_id: user.id })
      .select()
      .single();
    categories = created ? [created] : [];
  }

  const { data: notes } = await supabase
    .from("notes")
    .select("*, category:categories(*)")
    .order("created_at", { ascending: false });

  return {
    categories: (categories as Category[]) ?? [],
    notes: (notes as NoteWithCategory[]) ?? [],
  };
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  let contextPanel = null;

  if (pathname.startsWith("/dashboard/notes")) {
    const { categories, notes } = await getNotesData();
    contextPanel = <NotesPanel categories={categories} notes={notes} />;
  } else if (pathname.startsWith("/dashboard/finance")) {
    contextPanel = <FinancePanel />;
  } else if (pathname.startsWith("/dashboard/health")) {
    contextPanel = <HealthPanel />;
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      {contextPanel}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
