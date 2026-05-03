import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { GpsPoint } from "@/types/health";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  let query = supabase
    .from("health_steps")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (month) {
    const parts = month.split("-").map(Number);
    const y = parts[0] ?? 2000;
    const m = parts[1] ?? 1;
    const lastDay = new Date(y, m, 0).getDate();
    query = query
      .gte("date", `${month}-01`)
      .lte("date", `${month}-${String(lastDay).padStart(2, "0")}`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    date: string;
    steps: number;
    weight_kg: number | null;
    route: GpsPoint[] | null;
    distance_m: number | null;
  };

  const calories_burned =
    body.weight_kg != null
      ? Math.round(body.steps * 0.04 * (body.weight_kg / 60) * 10) / 10
      : null;

  const { data, error } = await supabase
    .from("health_steps")
    .upsert(
      { user_id: user.id, ...body, calories_burned },
      { onConflict: "user_id,date" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
