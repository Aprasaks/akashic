import type { ReactNode } from "react";

interface EditorPanelProps {
  children?: ReactNode;
}

export default function EditorPanel({ children }: EditorPanelProps) {
  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-zinc-100 bg-white">
      {children}
    </div>
  );
}
