import { useQuery } from "@tanstack/react-query";
import { CategorySpendChart, IncomeExpenseTrendChart } from "../components/charts/FinanceCharts";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuthStore } from "../store/authStore";
import { getCategorySpend, getDashboardSummary, getIncomeVsExpense } from "../services/finance";
import { formatCurrency, formatDate, toMonthLabel } from "../utils/format";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
  const categorySpendQuery = useQuery({ queryKey: ["category-spend", "dashboard"], queryFn: () => getCategorySpend() });
  const incomeExpenseQuery = useQuery({ queryKey: ["income-expense", "dashboard"], queryFn: () => getIncomeVsExpense() });

  const summary = summaryQuery.data;
  const categoryData = categorySpendQuery.data ?? [];
  const groupedTrend = Object.values((incomeExpenseQuery.data ?? []).reduce<Record<string, { label: string; income: number; expense: number }>>((acc, item) => {
    const key = `${item.year}-${item.month}`;
    if (!acc[key]) {
      acc[key] = { label: toMonthLabel(item.year, item.month), income: 0, expense: 0 };
    }
    if (item.type === "income") acc[key].income = item.amount;
    if (item.type === "expense") acc[key].expense = item.amount;
    return acc;
  }, {}));

  const cards = [
    { label: "Net Balance", amount: formatCurrency(summary?.netBalance ?? 0), accent: "primary", detail: "Across current month activity" },
    { label: "Income", amount: formatCurrency(summary?.income ?? 0), accent: "success", detail: "Captured from live transactions" },
    { label: "Expenses", amount: formatCurrency(summary?.expense ?? 0), accent: "warning", detail: "Updated from your backend data" },
    { label: "Savings Goals", amount: `${summary?.goals.length ?? 0}`, accent: "success", detail: "Active goals in progress" },
  ];

  return (
    <section className="stack-lg">
      <div className="dashboard-welcome panel-soft">
        <span className="eyebrow">Welcome back</span>
        <h2>{user?.displayName ?? "Finance Tracker"}</h2>
        <p>Your dashboard is ready with your latest balance, spending, and upcoming money activity.</p>
      </div>

      <PageHeader eyebrow="Dashboard" title="Your money, arranged into one quiet overview." description="Review this month's balance, recent activity, budgets, recurring items, and goal progress at a glance." />

      {summaryQuery.isLoading ? <div className="status-banner">Loading dashboard...</div> : null}

      <div className="summary-grid">
        {cards.map((card) => (
          <article className={`summary-card ${card.accent}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.amount}</strong>
            <p>{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="two-column">
        <CategorySpendChart data={categoryData} />
        <IncomeExpenseTrendChart data={groupedTrend} />
      </div>

      <div className="two-column">
        <div className="panel">
          <div className="section-title">Recent transactions</div>
          <div className="list">
            {(summary?.recentTransactions ?? []).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.merchant ?? "Untitled transaction"}</strong>
                  <p>{item.category ?? "Uncategorized"} | {formatDate(item.transactionDate)}</p>
                </div>
                <span className={item.type === "income" ? "pill green" : "pill amber"}>{formatCurrency(item.amount)}</span>
              </div>
            ))}
            {summary && summary.recentTransactions.length === 0 ? <div className="empty-state">No transactions yet. Add your first one from the Transactions screen.</div> : null}
          </div>
        </div>

        <div className="panel">
          <div className="section-title">Upcoming recurring payments</div>
          <div className="list">
            {(summary?.upcomingRecurringPayments ?? []).map((item) => (
              <div className="list-row" key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.frequency}</p>
                </div>
                <span>{formatDate(item.nextRunDate)}</span>
              </div>
            ))}
            {summary && summary.upcomingRecurringPayments.length === 0 ? <div className="empty-state">No recurring items yet.</div> : null}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="section-title">Savings goals</div>
        <div className="goal-grid">
          {(summary?.goals ?? []).map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
            return (
              <div className="goal-card" key={goal.id}>
                <div className="goal-header">
                  <strong>{goal.name}</strong>
                  <span>{goal.targetDate ? formatDate(goal.targetDate) : "No deadline"}</span>
                </div>
                <p>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <small>{progress}% complete</small>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

