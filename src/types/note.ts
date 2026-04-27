import type { Category } from "./category";

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteWithCategory extends Note {
  category: Category | null;
}
