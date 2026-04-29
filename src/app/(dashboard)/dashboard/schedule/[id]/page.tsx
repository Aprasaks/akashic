import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditorPanel from "@/components/layout/EditorPanel";

interface SchedulePageProps {
  params: Promise<{ id: string }>;
}

export default async function ScheduleDetailPage({ params }: SchedulePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", id)
    .single();

  if (!schedule) notFound();

  return (
    <div className="flex h-full">
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-zinc-300">{schedule.title}</p>
      </div>
      <EditorPanel />
    </div>
  );
}
