"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ContextPanel from "@/components/layout/ContextPanel";
import { useCategories } from "@/hooks/useCategories";
import { useNotes } from "@/hooks/useNotes";

export default function NotesPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const [refetchKey, setRefetchKey] = useState(0);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { categories } = useCategories(refetchKey);
  const { notes } = useNotes(refetchKey);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await res.json() as { note?: { id: string } };
    setSaving(false);
    setContent("");
    setRefetchKey((k) => k + 1);

    if (data.note) {
      router.push(`/dashboard/notes/${data.note.id}`);
    }
  }

  return (
    <ContextPanel title="메모">
      <div className="flex flex-1 flex-col overflow-y-auto py-2">
        {categories.map((category) => {
          const categoryNotes = notes.filter(
            (note) => note.category_id === category.id,
          );

          return (
            <div key={category.id} className="mb-2">
              <p className="px-4 py-1 text-xs font-medium tracking-wide text-zinc-400">
                {category.name.toUpperCase()}
              </p>
              {categoryNotes.length === 0 ? (
                <p className="px-4 py-1 text-xs text-zinc-200">비어 있음</p>
              ) : (
                categoryNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/dashboard/notes/${note.id}`}
                    className={`block truncate px-4 py-1.5 text-sm hover:bg-zinc-50 ${
                      pathname === `/dashboard/notes/${note.id}`
                        ? "font-medium text-zinc-900"
                        : "text-zinc-600"
                    }`}
                  >
                    {note.title ?? "제목 없음"}
                  </Link>
                ))
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-zinc-100 p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) handleSubmit(e as unknown as FormEvent);
          }}
          placeholder="메모를 입력하세요..."
          rows={3}
          className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="mt-2 w-full rounded-lg bg-zinc-900 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
        >
          {saving ? "저장 중..." : "저장 ⌘↵"}
        </button>
      </form>
    </ContextPanel>
  );
}
