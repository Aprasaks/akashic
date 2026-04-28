"use client";

import { useState, useEffect } from "react";

interface WelcomeFadeProps {
  greeting: string;
  goal: string | null;
}

export default function WelcomeFade({ greeting, goal }: WelcomeFadeProps) {
  const [showGoal, setShowGoal] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!goal) return;

    const cycle = () => {
      // 페이드 아웃
      setVisible(false);

      setTimeout(() => {
        setShowGoal((prev) => !prev);
        // 페이드 인
        setVisible(true);
      }, 600);
    };

    const interval = setInterval(cycle, 4000);
    return () => clearInterval(interval);
  }, [goal]);

  return (
    <h1
      className="text-xl font-semibold text-zinc-900 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {showGoal && goal ? goal : greeting}
    </h1>
  );
}
