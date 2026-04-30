"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import EditorPanel from "@/components/layout/EditorPanel";
import FinanceMain from "@/components/finance/FinanceMain";
import FinanceInputPanel from "@/components/finance/FinanceInputPanel";
import type { FinanceCategory } from "@/types/finance";

interface FinanceContentProps {
  categories: FinanceCategory[];
}

export default function FinanceContent({ categories }: FinanceContentProps) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaved = useCallback(() => {
    setRefreshKey((k) => k + 1);
    router.refresh();
  }, [router]);

  return (
    <div className="flex h-full">
      <FinanceMain categories={categories} refreshKey={refreshKey} />
      <EditorPanel>
        <div className="border-b border-zinc-100 px-5 py-4">
          <p className="text-sm font-medium text-zinc-900">내역 추가</p>
        </div>
        <FinanceInputPanel categories={categories} onSaved={handleSaved} />
      </EditorPanel>
    </div>
  );
}
