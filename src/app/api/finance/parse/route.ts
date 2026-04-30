import { type NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  const { text } = (await request.json()) as { text: string };
  if (!text?.trim()) return NextResponse.json({ error: "텍스트를 입력해주세요" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: categories } = await supabase
    .from("finance_categories")
    .select("name, type")
    .eq("user_id", user.id);

  const expenseCats = (categories ?? []).filter((c) => c.type === "expense").map((c) => c.name);
  const incomeCats = (categories ?? []).filter((c) => c.type === "income").map((c) => c.name);
  const today = new Date().toISOString().slice(0, 10);

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `한국어 금융 거래 텍스트를 파싱해서 JSON만 반환하세요. 설명 없이 JSON만.

지출 카테고리: ${expenseCats.join(", ")}
수입 카테고리: ${incomeCats.join(", ")}
오늘 날짜: ${today}

규칙:
- 결제/사용/썼어/샀어/지출 → type: "expense"
- 받았어/입금/벌었어/월급/수입 → type: "income"
- 금액은 정수 (원 단위)
- 날짜 미언급 시 오늘 날짜 사용
- payment_method: 카드/결제 → "card", 현금 → "cash", 이체/송금 → "transfer", 불명확 → null
- confidence: 명확할수록 1.0에 가깝게

반환 형식 (JSON만):
{"type":"income"|"expense","amount":숫자,"merchant":문자열|null,"category":카테고리명,"payment_method":"card"|"cash"|"transfer"|"other"|null,"date":"YYYY-MM-DD","confidence":숫자,"note":문자열|null}

입력: "${text}"`,
      },
    ],
  });

  const content = message.content[0];
  if (content?.type !== "text") return NextResponse.json({ error: "파싱 실패" }, { status: 500 });

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "AI 응답 파싱 실패" }, { status: 500 });
  }
}
