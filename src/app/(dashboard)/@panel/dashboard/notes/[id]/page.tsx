import { createClient } from "@/lib/supabase/server";
import NotesPanel from "@/components/notes/NotesPanel";
import type { Category, NoteWithCategory } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NotesPanelWithIdPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: notes }] = await Promise.all([
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
    supabase
      .from("notes")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <NotesPanel
      categories={(categories as Category[]) ?? []}
      notes={(notes as NoteWithCategory[]) ?? []}
      activeNoteId={id}
    />
  );
}
