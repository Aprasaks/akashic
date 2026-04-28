import { createClient } from "@/lib/supabase/server";
import WelcomeFade from "./WelcomeFade";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "좋은 아침이에요";
  if (hour < 18) return "안녕하세요";
  return "좋은 저녁이에요";
}

export default async function WelcomeSection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, goal")
    .eq("id", user?.id ?? "")
    .single();

  const name = profile?.name ?? user?.email?.split("@")[0] ?? "사용자";
  const greeting = `${getGreeting()}, ${name}님`;

  return (
    <div className="flex h-full flex-col justify-center px-6">
      <WelcomeFade greeting={greeting} goal={profile?.goal ?? null} />
    </div>
  );
}
