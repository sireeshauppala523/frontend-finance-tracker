import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CategorySpendChart, ForecastBalanceChart, IncomeExpenseTrendChart } from "../components/charts/FinanceCharts";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuthStore } from "../store/authStore";
import { getCategorySpend, getDashboardSummary, getForecastDaily, getForecastMonth, getHealthScore, getIncomeVsExpense } from "../services/finance";
import { formatCurrency, formatDate, toMonthLabel } from "../utils/format";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
  const forecastMonthQuery = useQuery({ queryKey: ["forecast-month"], queryFn: getForecastMonth });
  const forecastDailyQuery = useQuery({ queryKey: ["forecast-daily"], queryFn: getForecastDaily });
  const healthScoreQuery = useQuery({ queryKey: ["health-score", "dashboard"], queryFn: getHealthScore });
  const categorySpendQuery = useQuery({ queryKey: ["category-spend", "dashboard"], queryFn: () => getCategorySpend() });
  const incomeExpenseQuery = useQuery({ queryKey: ["income-expense", "dashboard"], queryFn: () => getIncomeVsExpense() });

  const summary = summaryQuery.data;
  const forecastMonth = forecastMonthQuery.data;
  const categoryData = categorySpendQuery.data ?? [];
  const forecastDailyData = (forecastDailyQuery.data ?? []).map((item) => ({
    label: new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    balance: item.balance,
  }));
  const groupedTrend = Object.values((incomeExpenseQuery.data ?? []).reduce<Record<string, { label: string; income: number; expense: number }>>((acc, item) => {
    const key = `${item.year}-${item.month}`;
    if (!acc[key]) {
      acc[key] = { label: toMonthLabel(item.year, item.month), income: 0, expense: 0 };
    }
    if (item.type === "income") acc[key].income = item.amount;
    if (item.type === "expense") acc[key].expense = item.amount;
    return acc;
  }, {}));
  const health = healthScoreQuery.data;

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

      <div className="panel health-score-panel">
        <div className="panel-heading">
          <div>
            <div className="section-title">Financial health score</div>
            <p className="panel-subtitle">{health?.summary ?? "Calculating a server-backed health score from your current finances."}</p>
          </div>
          <div className={`score-orb score-${health?.band.toLowerCase() ?? "healthy"}`}>{health?.score ?? "--"}</div>
        </div>

        <div className="factor-grid">
          {(health?.factors ?? []).map((factor) => (
            <article className="factor-card" key={factor.key}>
              <div className="factor-row">
                <strong>{factor.label}</strong>
                <span>{factor.score}/100</span>
              </div>
              <div className="progress-track">
                <div className={`progress-fill ${factor.score < 60 ? "danger" : ""}`} style={{ width: `${factor.score}%` }} />
              </div>
              <p>{factor.note}</p>
            </article>
          ))}
        </div>

        <div className="inline-links">
          <Link className="text-link" to="/insights">Open detailed insights</Link>
          <Link className="text-link" to="/rules">Review automation rules</Link>
        </div>
      </div>

      <div className="two-column dashboard-forecast-grid">
        <div className="panel forecast-panel">
          <div className="section-title">Cash flow forecast</div>
          {forecastMonthQuery.isLoading ? <div className="status-banner">Building forecast...</div> : null}
          {forecastMonth ? (
            <div className="forecast-stack">
              <div className="forecast-hero">
                <div>
                  <span className="forecast-label">Projected month-end balance</span>
                  <strong>{formatCurrency(forecastMonth.forecastedEndBalance)}</strong>
                </div>
                <span className={`pill ${forecastMonth.forecastedEndBalance < 0 ? "amber" : "green"}`}>
                  {forecastMonth.forecastedEndBalance < 0 ? "Risk" : "Stable"}
                </span>
              </div>

              <div className="forecast-metrics">
                <article className="forecast-metric">
                  <span>Current balance</span>
                  <strong>{formatCurrency(forecastMonth.currentBalance)}</strong>
                </article>
                <article className="forecast-metric">
                  <span>Safe to spend / day</span>
                  <strong>{formatCurrency(forecastMonth.safeToSpendPerDay)}</strong>
                </article>
                <article className="forecast-metric">
                  <span>Projected income</span>
                  <strong>{formatCurrency(forecastMonth.projectedIncome)}</strong>
                </article>
                <article className="forecast-metric">
                  <span>Projected expense</span>
                  <strong>{formatCurrency(forecastMonth.projectedExpense)}</strong>
                </article>
              </div>

              <div className="forecast-alerts">
                {forecastMonth.warnings.map((warning) => (
                  <div className={`forecast-alert ${warning.toLowerCase().includes("negative") || warning.toLowerCase().includes("low") ? "risk" : "calm"}`} key={warning}>
                    {warning}
                  </div>
                ))}
              </div>

              <div className="list">
                <div className="section-title">Upcoming known expenses</div>
                {forecastMonth.upcomingKnownExpenses.slice(0, 4).map((item) => (
                  <div className="list-row" key={`${item.title}-${item.date}`}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{formatDate(item.date)}</p>
                    </div>
                    <span className="pill amber">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                {forecastMonth.upcomingKnownExpenses.length === 0 ? (
                  <div className="empty-state">No upcoming recurring expenses are scheduled for the rest of this month.</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <ForecastBalanceChart data={forecastDailyData} />
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

