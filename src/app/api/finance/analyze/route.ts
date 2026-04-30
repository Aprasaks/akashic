import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { currentMonthRange } from "@/lib/financeDefaults";

const anthropic = new Anthropic();

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { start, end } = currentMonthRange();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, category:finance_categories(name)")
    .eq("user_id", user.id)
    .gte("date", start)
    .lte("date", end)
    .order("date");

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({ analysis: "이번 달 거래 내역이 없어요. 지출이나 수입을 먼저 기록해보세요!" });
  }

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const summary = transactions
    .map((t) => {
      const cat = t.category as { name: string } | null;
      return `${t.date} | ${t.type === "expense" ? "지출" : "수입"} | ${t.amount.toLocaleString()}원 | ${cat?.name ?? "미분류"} | ${t.merchant ?? ""}`;
    })
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: `당신은 아카식(Akashic), 사용자의 개인 AI 비서입니다. 이번 달 소비 내역을 분석해 맞춤형 인사이트를 제공하세요.

이번 달 총 수입: ${totalIncome.toLocaleString()}원
이번 달 총 지출: ${totalExpense.toLocaleString()}원
순수익: ${(totalIncome - totalExpense).toLocaleString()}원

거래 내역:
${summary}

3~5개의 구체적이고 실용적인 인사이트를 친근한 한국어로 작성하세요.
숫자를 구체적으로 언급하고, 패턴을 분석하고, 실행 가능한 조언을 포함하세요.
따뜻하고 개인 비서다운 톤으로 작성하세요.`,
      },
    ],
  });

  const content = message.content[0];
  if (content?.type !== "text") return NextResponse.json({ error: "분석 실패" }, { status: 500 });

  return NextResponse.json({ analysis: content.text });
}
