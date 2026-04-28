"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

export function useCategories(refetchKey: string | number = 0) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      setCategories((data as Category[]) ?? []);
      setLoading(false);
    }

    fetchCategories();
  }, [refetchKey]);

  return { categories, loading };
}
