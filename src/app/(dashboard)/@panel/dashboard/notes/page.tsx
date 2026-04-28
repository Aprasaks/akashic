import { createClient } from "@/lib/supabase/server";
import NotesPanel from "@/components/notes/NotesPanel";
import type { Category, NoteWithCategory } from "@/types";

export default async function NotesPanelPage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: notes }] = await Promise.all([
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
    supabase
      .from("notes")
      .select("*, category:categories(*)")
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <NotesPanel
      categories={(categories as Category[]) ?? []}
      notes={(notes as NoteWithCategory[]) ?? []}
      activeNoteId={null}
    />
  );
}
