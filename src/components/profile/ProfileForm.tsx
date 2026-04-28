"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import EmojiPicker from "./EmojiPicker";

const MBTI_LIST = [
  "INTJ", "INTP", "ENTJ", "ENTP",
  "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ",
  "ISTP", "ISFP", "ESTP", "ESFP",
];

interface Profile {
  emoji: string;
  name: string;
  birth_date: string;
  mbti: string;
  goal: string;
}

interface ProfileFormProps {
  userId: string;
  email: string;
  initialProfile: Profile;
}

export default function ProfileForm({ userId, email, initialProfile }: ProfileFormProps) {
  const [emoji, setEmoji] = useState(initialProfile.emoji || "🙂");
  const [name, setName] = useState(initialProfile.name || "");
  const [birthDate, setBirthDate] = useState(initialProfile.birth_date || "");
  const [mbti, setMbti] = useState(initialProfile.mbti || "");
  const [goal, setGoal] = useState(initialProfile.goal || "");
  const [newPassword, setNewPassword] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    await supabase.from("profiles").upsert({
      id: userId,
      emoji,
      name: name.trim() || null,
      birth_date: birthDate || null,
      mbti: mbti || null,
      goal: goal.trim() || null,
      updated_at: new Date().toISOString(),
    });

    if (newPassword.trim()) {
      await supabase.auth.updateUser({ password: newPassword });
      setNewPassword("");
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <div className="mx-auto w-full max-w-lg py-12">
        {/* 아바타 */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="flex size-20 items-center justify-center rounded-full bg-zinc-100 text-5xl transition-colors hover:bg-zinc-200"
          >
            {emoji}
          </button>
          <p className="text-xs text-zinc-400">클릭해서 변경</p>
        </div>

        {/* 폼 */}
        <div className="flex flex-col gap-5">
          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-name" className="text-xs font-medium text-zinc-500">이름</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400 focus:bg-white"
            />
          </div>

          {/* 한 줄 목표 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-goal" className="text-xs font-medium text-zinc-500">한 줄 목표</label>
            <input
              id="profile-goal"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="예: 2026년 안에 SaaS 출시"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400 focus:bg-white"
            />
          </div>

          {/* 생년월일 + MBTI */}
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="profile-birth" className="text-xs font-medium text-zinc-500">생년월일</label>
              <input
                id="profile-birth"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="profile-mbti" className="text-xs font-medium text-zinc-500">MBTI</label>
              <select
                id="profile-mbti"
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
                className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:bg-white"
              >
                <option value="">선택</option>
                {MBTI_LIST.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="my-1 border-t border-zinc-100" />

          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">이메일</label>
            <input
              type="email"
              value={email}
              readOnly
              className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-400 outline-none"
            />
          </div>

          {/* 비밀번호 변경 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-password" className="text-xs font-medium text-zinc-500">새 비밀번호</label>
            <input
              id="profile-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="변경할 경우에만 입력"
              className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-zinc-400 focus:bg-white"
            />
          </div>

          {/* 저장 버튼 */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 rounded-xl bg-zinc-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
          >
            {saving ? "저장 중..." : saved ? "저장됨 ✓" : "저장"}
          </button>
        </div>
      </div>

      {showEmojiPicker && (
        <EmojiPicker
          selected={emoji}
          onSelect={setEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    </>
  );
}
