"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import ContextPanel from "@/components/layout/ContextPanel";
import { useCategories } from "@/hooks/useCategories";
import { useNotes } from "@/hooks/useNotes";

export default function NotesPanel() {
  const pathname = usePathname();
  const { categories } = useCategories(pathname);
  const { notes } = useNotes(pathname);
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());

  function toggleCategory(id: string) {
    setClosedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <ContextPanel title="메모">
      <div className="flex flex-col py-2">
        {categories.map((category) => {
          const isOpen = !closedIds.has(category.id);
          const categoryNotes = notes.filter(
            (note) => note.category_id === category.id,
          );

          return (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-zinc-50"
              >
                <Folder size={14} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
                <span className="flex-1 text-left text-sm font-medium text-zinc-700">
                  {category.name}
                </span>
                {isOpen ? (
                  <ChevronDown size={14} className="text-zinc-400" />
                ) : (
                  <ChevronRight size={14} className="text-zinc-400" />
                )}
              </button>

              {isOpen && (
                <div className="mb-1">
                  {categoryNotes.length === 0 ? (
                    <p className="px-8 py-1 text-xs text-zinc-200">비어 있음</p>
                  ) : (
                    categoryNotes.map((note) => (
                      <Link
                        key={note.id}
                        href={`/dashboard/notes/${note.id}`}
                        className={`block truncate px-8 py-1.5 text-sm hover:bg-zinc-50 ${
                          pathname === `/dashboard/notes/${note.id}`
                            ? "font-medium text-zinc-900"
                            : "text-zinc-500"
                        }`}
                      >
                        {note.title ?? "제목 없음"}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ContextPanel>
  );
}
