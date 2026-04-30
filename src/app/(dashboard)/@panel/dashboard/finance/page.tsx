import { createClient } from "@/lib/supabase/server";
import FinancePanel from "@/components/finance/FinancePanel";
import { currentMonthRange } from "@/lib/financeDefaults";
import type { Transaction } from "@/types/finance";

export default async function FinancePanelPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <FinancePanel income={0} expense={0} recent={[]} />;

  const { start, end } = currentMonthRange();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:finance_categories(id, name, color, type)")
    .eq("user_id", user.id)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  const all = (transactions ?? []) as Transaction[];
  const income = all.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = all.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const recent = all.slice(0, 5);

  return <FinancePanel income={income} expense={expense} recent={recent} />;
}
