export type FinanceType = "income" | "expense";

export interface Finance {
  id: string;
  clinicId: string;
  type: FinanceType;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
}
