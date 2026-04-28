"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import type { Note } from "@/types";

interface NoteEditorProps {
  initialNote?: Note & { categoryName?: string };
}

export default function NoteEditor({ initialNote }: NoteEditorProps) {
  const router = useRouter();
  const { categories } = useCategories();
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [categoryInput, setCategoryInput] = useState(initialNote?.categoryName ?? "");
  const [content, setContent] = useState(initialNote?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isEditMode = !!initialNote;

  async function resolveCategoryId(userId: string): Promise<string | null> {
    const name = categoryInput.trim() || "일반";
    const supabase = createClient();

    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", name)
      .single();

    if (existing) return existing.id as string;

    const { data: created } = await supabase
      .from("categories")
      .insert({ user_id: userId, name })
      .select("id")
      .single();

    return created?.id ?? null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const categoryId = await resolveCategoryId(user.id);

    if (isEditMode) {
      await supabase
        .from("notes")
        .update({
          title: title.trim() || null,
          content: content.trim(),
          category_id: categoryId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", initialNote.id);

      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.push(`/dashboard/notes/${initialNote.id}`);
      router.refresh();
    } else {
      const { data: note } = await supabase
        .from("notes")
        .insert({
          user_id: user.id,
          title: title.trim() || null,
          content: content.trim(),
          category_id: categoryId,
        })
        .select()
        .single();

      setSaving(false);
      setTitle("");
      setContent("");
      setCategoryInput("");

      if (note) router.push(`/dashboard/notes/${note.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-4 p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="note-title" className="text-xs font-medium text-zinc-400">제목</label>
        <input
          id="note-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목 (선택)"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400 focus:bg-white"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="note-category" className="text-xs font-medium text-zinc-400">카테고리</label>
        <input
          id="note-category"
          type="text"
          list="category-list"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder="카테고리 (기본: 일반)"
          className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400 focus:bg-white"
        />
        <datalist id="category-list">
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name} />
          ))}
        </datalist>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="note-content" className="text-xs font-medium text-zinc-400">내용</label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          className="flex-1 resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400 focus:bg-white"
        />
      </div>

      <button
        type="submit"
        disabled={saving || !content.trim()}
        className="rounded-lg bg-zinc-900 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
      >
        {saving ? "저장 중..." : saved ? "저장됨 ✓" : isEditMode ? "수정" : "저장"}
      </button>
    </form>
  );
}
