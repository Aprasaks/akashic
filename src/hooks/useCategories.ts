"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (data && data.length === 0) {
        const { data: created } = await supabase
          .from("categories")
          .insert({ name: "일반", user_id: user.id })
          .select()
          .single();

        if (created) setCategories([created]);
      } else {
        setCategories(data ?? []);
      }

      setLoading(false);
    }

    fetchCategories();
  }, []);

  return { categories, loading };
}
