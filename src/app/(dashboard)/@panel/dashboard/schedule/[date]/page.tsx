import { createClient } from "@/lib/supabase/server";
import SchedulePanel from "@/components/schedule/SchedulePanel";

interface Props {
  params: Promise<{ date: string }>;
}

export default async function SchedulePanelWithDatePage({ params }: Props) {
  const { date } = await params;
  const supabase = await createClient();
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*")
    .order("start_at");

  return <SchedulePanel schedules={schedules ?? []} activeDate={date} />;
}
