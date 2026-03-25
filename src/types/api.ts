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
  accessRole?: "owner" | "editor" | "viewer";
  isShared?: boolean;
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
  accountId?: string | null;
  month: number;
  year: number;
  amount: number;
  alertThresholdPercent: number;
  spent: number;
  progress: number;
  category: Category;
  account?: Account | null;
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

export type RuleCondition = {
  field: "merchant" | "amount" | "category";
  operator: "equals" | "contains" | "greaterThan" | "lessThan";
  value: string;
};

export type RuleAction = {
  type: "categorize" | "tag" | "alert";
  value: string;
};

export type AutomationRule = {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SharedAccountMember = {
  id: string;
  accountId: string;
  userId: string;
  displayName: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  createdAt: string;
};

export type SharedAccountGroup = {
  accountId: string;
  accountName: string;
  owner: boolean;
  members: SharedAccountMember[];
};

export type HealthFactor = {
  key: string;
  label: string;
  score: number;
  note: string;
};

export type FinancialHealthSnapshot = {
  score: number;
  band: "Excellent" | "Healthy" | "Fair" | "Watch";
  summary: string;
  suggestions: string[];
  factors: HealthFactor[];
};
