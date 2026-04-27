import { Dancing_Script } from "next/font/google";
import Link from "next/link";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
});

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="flex w-full max-w-sm flex-col gap-8 px-6">
        <h1 className={`text-center text-7xl text-zinc-900 ${dancingScript.className}`}>
          Akashic
        </h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">이메일</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700">비밀번호</label>
            <input
              type="password"
              placeholder="••••••••"
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>

          <button className="mt-2 rounded-lg bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700">
            로그인
          </button>

          <p className="text-center text-sm text-zinc-500">
            계정이 없으신가요?{" "}
            <Link href="/signup" className="font-medium text-zinc-900 hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
