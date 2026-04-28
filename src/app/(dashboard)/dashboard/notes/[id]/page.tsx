import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditorPanel from "@/components/layout/EditorPanel";

interface NotePageProps {
  params: Promise<{ id: string }>;
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (!note) notFound();

  return (
    <div className="flex h-full">
      <div className="flex flex-1 justify-center overflow-y-auto px-8 py-12">
        <article className="w-full max-w-2xl">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {note.title ?? "제목 없음"}
          </h1>
          <p className="mt-2 text-xs text-zinc-400">{formatDateTime(note.created_at)}</p>
          <div className="mt-8 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
            {note.content}
          </div>
        </article>
      </div>
      <EditorPanel />
    </div>
  );
}
