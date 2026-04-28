import type { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
  panel,
}: {
  children: ReactNode;
  panel: ReactNode;
}) {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      {panel}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
