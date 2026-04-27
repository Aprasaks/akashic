"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NoteWithCategory } from "@/types";

export function useNotes() {
  const [notes, setNotes] = useState<NoteWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      const supabase = createClient();

      const { data } = await supabase
        .from("notes")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

      setNotes((data as NoteWithCategory[]) ?? []);
      setLoading(false);
    }

    fetchNotes();
  }, []);

  return { notes, loading };
}
