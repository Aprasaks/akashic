"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight, Folder } from "lucide-react";
import ContextPanel from "@/components/layout/ContextPanel";
import { createClient } from "@/lib/supabase/client";
import type { Category, NoteWithCategory } from "@/types";

interface NotesPanelProps {
  categories: Category[];
  notes: NoteWithCategory[];
  activeNoteId: string | null;
}

interface ContextMenu {
  x: number;
  y: number;
  category: Category;
}

export default function NotesPanel({ categories, notes, activeNoteId }: NotesPanelProps) {
  const router = useRouter();
  const [closedIds, setClosedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick() {
      setContextMenu(null);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function toggleCategory(id: string) {
    setClosedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleContextMenu(e: React.MouseEvent, category: Category) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, category });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    const supabase = createClient();

    await supabase.from("notes").delete().eq("category_id", deleteTarget.id);
    await supabase.from("categories").delete().eq("id", deleteTarget.id);

    setDeleteTarget(null);
    setDeleting(false);
    router.refresh();
  }

  return (
    <>
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
                  onContextMenu={(e) => handleContextMenu(e, category)}
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
                            activeNoteId === note.id
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

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 rounded-lg border border-zinc-100 bg-white py-1 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setDeleteTarget(contextMenu.category);
              setContextMenu(null);
            }}
            className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-80 rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-zinc-900">카테고리 삭제</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              <span className="font-medium text-zinc-800">&ldquo;{deleteTarget.name}&rdquo;</span> 카테고리와
              포함된 모든 메모가 영구 삭제됩니다. 되돌릴 수 없어요.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50 disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-40"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
