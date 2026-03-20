import type { Budget, Goal, RecurringItem, SummaryCard, Transaction } from "../types";

export const summaryCards: SummaryCard[] = [
  { label: "Net Balance", amount: "$8,420", accent: "primary", detail: "Calm view across all accounts" },
  { label: "Income", amount: "$5,900", accent: "success", detail: "This month, up 12%" },
  { label: "Expenses", amount: "$3,180", accent: "warning", detail: "Within planned range" },
  { label: "Savings Goals", amount: "$2,410", accent: "success", detail: "3 active goals progressing" },
];

export const transactions: Transaction[] = [
  { id: "1", merchant: "Grocery Mart", category: "Food", account: "Main Bank", type: "expense", amount: "-$42.00", date: "2026-03-01" },
  { id: "2", merchant: "Employer Inc", category: "Salary", account: "Main Bank", type: "income", amount: "+$2,400.00", date: "2026-03-01" },
  { id: "3", merchant: "Uber", category: "Transport", account: "Credit Card", type: "expense", amount: "-$11.50", date: "2026-03-02" },
  { id: "4", merchant: "Cafe Sol", category: "Food", account: "Cash Wallet", type: "expense", amount: "-$9.20", date: "2026-03-03" }
];

export const budgets: Budget[] = [
  { id: "1", category: "Food", spent: 650, total: 800 },
  { id: "2", category: "Transport", spent: 120, total: 250 },
  { id: "3", category: "Entertainment", spent: 210, total: 200 },
  { id: "4", category: "Shopping", spent: 75, total: 300 }
];

export const goals: Goal[] = [
  { id: "1", name: "Emergency Fund", current: 45000, target: 100000, due: "Dec 2026" },
  { id: "2", name: "Vacation", current: 20000, target: 50000, due: "Aug 2026" },
  { id: "3", name: "New Laptop", current: 55000, target: 80000, due: "Oct 2026" }
];

export const recurringItems: RecurringItem[] = [
  { id: "1", title: "Netflix", amount: "$15.00", frequency: "Monthly", nextRunDate: "Mar 20" },
  { id: "2", title: "Rent", amount: "$920.00", frequency: "Monthly", nextRunDate: "Mar 25" },
  { id: "3", title: "Spotify", amount: "$8.00", frequency: "Monthly", nextRunDate: "Mar 27" }
];