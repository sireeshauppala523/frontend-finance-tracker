export type SupportedCurrency = "INR" | "USD" | "EUR" | "GBP" | "AED";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  preferredCurrency?: SupportedCurrency;
};

export type AuthUser = {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  preferredCurrency?: SupportedCurrency;
};

export type ProfileResponse = {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  preferredCurrency: SupportedCurrency;
};

export type Category = {
  id: string;
  userId?: string | null;
  name: string;
  type: string;
  color: string;
  icon: string;
  isArchived: boolean;
};

export type Account = {
  id: string;
  name: string;
  type: string;
  openingBalance: number;
  currentBalance: number;
  institutionName?: string | null;
};

export type TransactionItem = {
  id: string;
  merchant?: string | null;
  note?: string | null;
  amount: number;
  type: "income" | "expense" | "transfer";
  transactionDate: string;
  category?: Category | null;
  account?: Account | null;
  accountId: string;
  categoryId?: string | null;
};

export type BudgetItem = {
  id: string;
  month: number;
  year: number;
  amount: number;
  alertThresholdPercent: number;
  spent: number;
  progress: number;
  category: Category;
};

export type GoalItem = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  linkedAccountId?: string | null;
  icon: string;
  color: string;
  status: string;
};

export type RecurringItem = {
  id: string;
  title: string;
  type: string;
  amount: number;
  categoryId?: string | null;
  accountId?: string | null;
  frequency: string;
  startDate: string;
  endDate?: string | null;
  nextRunDate: string;
  autoCreateTransaction: boolean;
  isPaused: boolean;
};

export type DashboardSummary = {
  income: number;
  expense: number;
  netBalance: number;
  recentTransactions: Array<{
    id: string;
    merchant?: string | null;
    amount: number;
    type: "income" | "expense" | "transfer";
    transactionDate: string;
    category?: string | null;
  }>;
  upcomingRecurringPayments: RecurringItem[];
  goals: GoalItem[];
};

export type ForecastMonth = {
  currentBalance: number;
  forecastedEndBalance: number;
  projectedIncome: number;
  projectedExpense: number;
  safeToSpendPerDay: number;
  daysRemaining: number;
  warnings: string[];
  upcomingKnownExpenses: Array<{
    title: string;
    amount: number;
    date: string;
    source: string;
  }>;
};

export type ForecastDailyPoint = {
  date: string;
  balance: number;
  income: number;
  expense: number;
};

export type CategorySpendPoint = {
  category: string;
  amount: number;
};

export type IncomeExpensePoint = {
  year: number;
  month: number;
  type: string;
  amount: number;
};
