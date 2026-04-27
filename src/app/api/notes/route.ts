import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const { content } = await request.json() as { content: string };

  if (!content?.trim()) {
    return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "인증 필요" }, { status: 401 });
  }

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    system: `당신은 Akashic AI입니다. 사용자 메모에서 제목과 카테고리를 추출합니다.
반드시 JSON만 응답하세요: {"title": "제목 또는 null", "category": "카테고리명"}
- title: 핵심을 한 줄로. 없으면 null.
- category: 맛집/일상/업무/아이디어/건강/돈 중 적합한 것. 없으면 새로 만들어도 됨.`,
    messages: [{ role: "user", content }],
  });

  let title: string | null = null;
  let categoryName = "일반";

  try {
    const text = (message.content[0] as { text: string }).text;
    const parsed = JSON.parse(text) as { title: string | null; category: string };
    title = parsed.title ?? null;
    categoryName = parsed.category ?? "일반";
  } catch {
    // 파싱 실패 시 기본값 사용
  }

  let { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("user_id", user.id)
    .eq("name", categoryName)
    .single();

  if (!category) {
    const { data: newCategory } = await supabase
      .from("categories")
      .insert({ user_id: user.id, name: categoryName })
      .select("id")
      .single();
    category = newCategory;
  }

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title,
      content,
      category_id: category?.id ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ note });
}
