"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ContextPanel from "@/components/layout/ContextPanel";
import { useCategories } from "@/hooks/useCategories";
import { useNotes } from "@/hooks/useNotes";

export default function NotesPanel() {
  const pathname = usePathname();
  const { categories } = useCategories();
  const { notes } = useNotes();

  return (
    <ContextPanel title="메모">
      <div className="flex flex-col py-2">
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
    </ContextPanel>
  );
}
