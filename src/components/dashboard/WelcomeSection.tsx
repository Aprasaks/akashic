import { createClient } from "@/lib/supabase/server";

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
    .select("name")
    .eq("id", user?.id ?? "")
    .single();

  const name = profile?.name ?? user?.email?.split("@")[0] ?? "사용자";

  return (
    <div className="flex h-full flex-col justify-center px-6">
      <h1 className="text-xl font-semibold text-zinc-900">
        {getGreeting()}, {name}님
      </h1>
    </div>
  );
}
