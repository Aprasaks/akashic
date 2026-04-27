"use client";

import { useState, useEffect } from "react";
import { Dancing_Script } from "next/font/google";
import { useRouter } from "next/navigation";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
});

const TAGLINE = "당신의 인생을 설계합니다";

export default function RootPage() {
  const [displayed, setDisplayed] = useState("");
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delay = setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setDisplayed(TAGLINE.slice(0, i));
        if (i >= TAGLINE.length) {
          clearInterval(timer);
          setTimeout(() => setShowHint(true), 500);
        }
      }, 65);
      return () => clearInterval(timer);
    }, 800);

    return () => clearTimeout(delay);
  }, []);

  useEffect(() => {
    if (!showHint) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") router.push("/login");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHint, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-10">
        <h1 className={`text-9xl text-zinc-900 ${dancingScript.className}`}>
          Akashic
        </h1>

        <p className="h-5 text-sm tracking-widest text-zinc-400">
          {displayed}
          {displayed.length < TAGLINE.length && (
            <span className="animate-pulse">|</span>
          )}
        </p>

        <p className={`text-xs text-zinc-300 transition-opacity duration-700 ${showHint ? "opacity-100" : "opacity-0"}`}>
          Press Enter ↵
        </p>
      </div>
    </div>
  );
}
