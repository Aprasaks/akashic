"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    const supabase = createClient();
    await supabase.from("notes").delete().eq("id", noteId);
    router.push("/dashboard/notes");
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-400">삭제할까요?</span>
        <button
          onClick={handleDelete}
          className="text-xs font-medium text-red-500 hover:text-red-600"
        >
          삭제
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-zinc-400 hover:text-zinc-600"
        >
          취소
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1 text-sm text-zinc-500 hover:text-red-400"
    >
      <Trash2 size={13} strokeWidth={1.5} />
      삭제
    </button>
  );
}
