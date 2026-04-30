export interface FinanceCategory {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  is_preset: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "income" | "expense";
  amount: number;
  category_id: string | null;
  category?: Pick<FinanceCategory, "id" | "name" | "color" | "type"> | null;
  merchant: string | null;
  payment_method: "card" | "cash" | "transfer" | "other" | null;
  date: string;
  note: string | null;
  source: "ai" | "manual";
  created_at: string;
}

export interface ParsedTransaction {
  type: "income" | "expense";
  amount: number;
  merchant: string | null;
  category: string;
  payment_method: "card" | "cash" | "transfer" | "other" | null;
  date: string;
  confidence: number;
  note: string | null;
}
