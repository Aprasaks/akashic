import type { ReactNode } from "react";

interface ContextPanelProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function ContextPanel({ title, action, children }: ContextPanelProps) {
  return (
    <div className="flex h-screen w-60 shrink-0 flex-col border-r border-zinc-100 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
        <h2 className="text-sm font-medium text-zinc-900">{title}</h2>
        {action}
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
    </div>
  );
}
