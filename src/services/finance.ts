import { api } from "./api";
import type {
  Account,
  ApiResponse,
  BudgetItem,
  Category,
  CategorySpendPoint,
  DashboardSummary,
  FinancialHealthSnapshot,
  GoalItem,
  ForecastDailyPoint,
  ForecastMonth,
  IncomeExpensePoint,
  RecurringItem,
  AutomationRule,
  SharedAccountGroup,
  SharedAccountMember,
  TransactionItem,
} from "../types/api";

export async function getDashboardSummary() {
  const response = await api.get<ApiResponse<DashboardSummary>>("/dashboard/summary");
  return response.data.data;
}

export async function getForecastMonth() {
  const response = await api.get<ApiResponse<ForecastMonth>>("/forecast/month");
  return response.data.data;
}

export async function getForecastDaily() {
  const response = await api.get<ApiResponse<ForecastDailyPoint[]>>("/forecast/daily");
  return response.data.data;
}

export async function getHealthScore() {
  const response = await api.get<ApiResponse<FinancialHealthSnapshot>>("/insights/health-score");
  return response.data.data;
}

export async function getTransactions(params: { type?: string; accountId?: string; categoryId?: string; search?: string }) {
  const response = await api.get<ApiResponse<TransactionItem[]>>("/transactions", { params });
  return response.data.data;
}

export async function createTransaction(payload: {
  accountId: string;
  categoryId?: string;
  type: string;
  amount: number;
  date: string;
  merchant?: string;
  note?: string;
  paymentMethod?: string;
  tags?: string[];
  recurringTransactionId?: string;
}) {
  const response = await api.post<ApiResponse<TransactionItem>>("/transactions", payload);
  return response.data.data;
}

export async function updateTransaction(transactionId: string, payload: {
  accountId: string;
  categoryId?: string;
  type: string;
  amount: number;
  date: string;
  merchant?: string;
  note?: string;
  paymentMethod?: string;
  tags?: string[];
  recurringTransactionId?: string;
}) {
  const response = await api.put<ApiResponse<TransactionItem>>(`/transactions/${transactionId}`, payload);
  return response.data.data;
}

export async function deleteTransaction(transactionId: string) {
  await api.delete(`/transactions/${transactionId}`);
}

export async function getCategories() {
  const response = await api.get<ApiResponse<Category[]>>("/categories");
  return response.data.data;
}

export async function createCategory(payload: {
  name: string;
  type: string;
  color: string;
  icon?: string;
  isArchived?: boolean;
}) {
  const response = await api.post<ApiResponse<Category>>("/categories", {
    name: payload.name,
    type: payload.type,
    color: payload.color,
    icon: payload.icon ?? "circle",
    isArchived: payload.isArchived ?? false,
  });
  return response.data.data;
}

export async function updateCategory(categoryId: string, payload: {
  name: string;
  type: string;
  color: string;
  icon?: string;
  isArchived?: boolean;
}) {
  const response = await api.put<ApiResponse<Category>>(`/categories/${categoryId}`, {
    name: payload.name,
    type: payload.type,
    color: payload.color,
    icon: payload.icon ?? "circle",
    isArchived: payload.isArchived ?? false,
  });
  return response.data.data;
}

export async function deleteCategory(categoryId: string) {
  await api.delete(`/categories/${categoryId}`);
}

export async function getAccounts() {
  const response = await api.get<ApiResponse<Account[]>>("/accounts");
  return response.data.data;
}

export async function createAccount(payload: {
  name: string;
  type: string;
  openingBalance: number;
  institutionName?: string;
}) {
  const response = await api.post<ApiResponse<Account>>("/accounts", payload);
  return response.data.data;
}

export async function transferFunds(payload: {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  date: string;
  note?: string;
}) {
  const response = await api.post<ApiResponse<{ source: Account; destination: Account }>>("/accounts/transfer", payload);
  return response.data.data;
}

export async function getBudgets(month: number, year: number) {
  const response = await api.get<ApiResponse<BudgetItem[]>>("/budgets", { params: { month, year } });
  return response.data.data;
}

export async function createBudget(payload: { categoryId: string; accountId?: string | null; month: number; year: number; amount: number; alertThresholdPercent: number }) {
  const response = await api.post<ApiResponse<BudgetItem>>("/budgets", payload);
  return response.data.data;
}

export async function getGoals() {
  const response = await api.get<ApiResponse<GoalItem[]>>("/goals");
  return response.data.data;
}

export async function createGoal(payload: {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  linkedAccountId?: string | null;
  icon: string;
  color: string;
  status: string;
}) {
  const response = await api.post<ApiResponse<GoalItem>>("/goals", payload);
  return response.data.data;
}

export async function updateGoal(goalId: string, payload: {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  linkedAccountId?: string | null;
  icon: string;
  color: string;
  status: string;
}) {
  const response = await api.put<ApiResponse<GoalItem>>(`/goals/${goalId}`, payload);
  return response.data.data;
}

export async function deleteGoal(goalId: string) {
  await api.delete(`/goals/${goalId}`);
}

export async function contributeGoal(goalId: string, payload: { amount: number; sourceAccountId?: string | null }) {
  const response = await api.post<ApiResponse<GoalItem>>(`/goals/${goalId}/contribute`, payload);
  return response.data.data;
}

export async function getRecurring() {
  const response = await api.get<ApiResponse<RecurringItem[]>>("/recurring");
  return response.data.data;
}

export async function createRecurring(payload: {
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
}) {
  const response = await api.post<ApiResponse<RecurringItem>>("/recurring", payload);
  return response.data.data;
}

export async function getCategorySpend(from?: string, to?: string) {
  const response = await api.get<ApiResponse<CategorySpendPoint[]>>("/reports/category-spend", { params: { from, to } });
  return response.data.data;
}

export async function getIncomeVsExpense(from?: string, to?: string) {
  const response = await api.get<ApiResponse<IncomeExpensePoint[]>>("/reports/income-vs-expense", { params: { from, to } });
  return response.data.data;
}

export async function getAccountBalanceTrend() {
  const response = await api.get<ApiResponse<Array<{ name: string; currentBalance: number; lastUpdatedAt: string }>>>("/reports/account-balance-trend");
  return response.data.data;
}

export async function getRules() {
  const response = await api.get<ApiResponse<AutomationRule[]>>("/rules");
  return response.data.data;
}

export async function createRule(payload: {
  name: string;
  condition: AutomationRule["condition"];
  action: AutomationRule["action"];
  isActive: boolean;
}) {
  const response = await api.post<ApiResponse<AutomationRule>>("/rules", payload);
  return response.data.data;
}

export async function updateRule(ruleId: string, payload: {
  name: string;
  condition: AutomationRule["condition"];
  action: AutomationRule["action"];
  isActive: boolean;
}) {
  const response = await api.put<ApiResponse<AutomationRule>>(`/rules/${ruleId}`, payload);
  return response.data.data;
}

export async function deleteRule(ruleId: string) {
  await api.delete(`/rules/${ruleId}`);
}

export async function getSharedAccounts() {
  const response = await api.get<ApiResponse<SharedAccountGroup[]>>("/shared-accounts");
  return response.data.data;
}

export async function addSharedAccountMember(payload: {
  accountId: string;
  email: string;
  role: SharedAccountMember["role"];
}) {
  const response = await api.post<ApiResponse<SharedAccountMember>>("/shared-accounts/members", payload);
  return response.data.data;
}

export async function removeSharedAccountMember(memberId: string) {
  await api.delete(`/shared-accounts/members/${memberId}`);
}
