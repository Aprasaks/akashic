import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EXPENSE_DEFAULTS, INCOME_DEFAULTS } from "@/lib/financeDefaults";
import FinanceContent from "@/components/finance/FinanceContent";
import type { FinanceCategory } from "@/types/finance";

export default async function FinancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("finance_categories")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (!existing || existing.length === 0) {
    await supabase.from("finance_categories").insert([
      ...EXPENSE_DEFAULTS.map((d) => ({
        user_id: user.id,
        name: d.name,
        type: "expense",
        color: d.color,
        is_preset: true,
      })),
      ...INCOME_DEFAULTS.map((d) => ({
        user_id: user.id,
        name: d.name,
        type: "income",
        color: d.color,
        is_preset: true,
      })),
    ]);
  }

  const { data: categories } = await supabase
    .from("finance_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("type")
    .order("name");

  return <FinanceContent categories={(categories ?? []) as FinanceCategory[]} />;
}
