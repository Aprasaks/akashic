import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");

  let query = supabase
    .from("transactions")
    .select("*, category:finance_categories(id, name, color, type)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

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
    type: "income" | "expense";
    amount: number;
    category_id: string | null;
    merchant: string | null;
    payment_method: string | null;
    date: string;
    note: string | null;
    source: "ai" | "manual";
  };

  const { data, error } = await supabase
    .from("transactions")
    .insert({ user_id: user.id, ...body })
    .select("*, category:finance_categories(id, name, color, type)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
