export type SummaryCard = {
  label: string;
  amount: string;
  accent: "primary" | "success" | "warning";
  detail: string;
};

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  account: string;
  type: "income" | "expense" | "transfer";
  amount: string;
  date: string;
};

export type Budget = {
  id: string;
  category: string;
  spent: number;
  total: number;
};

export type Goal = {
  id: string;
  name: string;
  current: number;
  target: number;
  due: string;
};

export type RecurringItem = {
  id: string;
  title: string;
  amount: string;
  frequency: string;
  nextRunDate: string;
};