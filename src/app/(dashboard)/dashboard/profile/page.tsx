import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="h-full overflow-y-auto px-8">
      <ProfileForm
        userId={user.id}
        email={user.email ?? ""}
        initialProfile={{
          emoji: profile?.emoji ?? "🙂",
          name: profile?.name ?? "",
          birth_date: profile?.birth_date ?? "",
          mbti: profile?.mbti ?? "",
          goal: profile?.goal ?? "",
        }}
      />
    </div>
  );
}
