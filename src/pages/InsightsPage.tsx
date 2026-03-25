import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CategorySpendChart, ForecastBalanceChart, IncomeExpenseTrendChart } from "../components/charts/FinanceCharts";
import { PageHeader } from "../components/ui/PageHeader";
import { getBudgets, getCategorySpend, getDashboardSummary, getForecastDaily, getForecastMonth, getHealthScore, getIncomeVsExpense } from "../services/finance";
import { formatCurrency, toMonthLabel } from "../utils/format";

export function InsightsPage() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  const summaryQuery = useQuery({ queryKey: ["dashboard-summary", "insights"], queryFn: getDashboardSummary });
  const forecastMonthQuery = useQuery({ queryKey: ["forecast-month", "insights"], queryFn: getForecastMonth });
  const forecastDailyQuery = useQuery({ queryKey: ["forecast-daily", "insights"], queryFn: getForecastDaily });
  const healthScoreQuery = useQuery({ queryKey: ["health-score", "insights"], queryFn: getHealthScore });
  const budgetsQuery = useQuery({ queryKey: ["budgets", month, year, "insights"], queryFn: () => getBudgets(month, year) });
  const categorySpendQuery = useQuery({ queryKey: ["category-spend", "insights"], queryFn: () => getCategorySpend() });
  const incomeExpenseQuery = useQuery({ queryKey: ["income-expense", "insights"], queryFn: () => getIncomeVsExpense() });

  const groupedTrend = useMemo(
    () => Object.values((incomeExpenseQuery.data ?? []).reduce<Record<string, { label: string; income: number; expense: number }>>((acc, item) => {
      const key = `${item.year}-${item.month}`;
      if (!acc[key]) acc[key] = { label: toMonthLabel(item.year, item.month), income: 0, expense: 0 };
      if (item.type === "income") acc[key].income = item.amount;
      if (item.type === "expense") acc[key].expense = item.amount;
      return acc;
    }, {})),
    [incomeExpenseQuery.data],
  );

  const health = healthScoreQuery.data;

  const forecastDaily = (forecastDailyQuery.data ?? []).map((item) => ({
    label: new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    balance: item.balance,
  }));

  const topCategory = [...(categorySpendQuery.data ?? [])].sort((left, right) => right.amount - left.amount)[0];
  const overspentBudget = [...(budgetsQuery.data ?? [])].sort((left, right) => right.progress - left.progress)[0];
  const netPosition = (summaryQuery.data?.income ?? 0) - (summaryQuery.data?.expense ?? 0);
  const highlightCards = [
    {
      title: "Health score",
      value: health ? `${health.score}/100` : "--",
      note: health ? `${health.band} footing for the current month.` : "Server is preparing your health score.",
      tone: (health?.score ?? 0) >= 70 ? "success" : "warning",
    },
    {
      title: "Largest spend category",
      value: topCategory ? topCategory.category : "No data",
      note: topCategory ? formatCurrency(topCategory.amount) : "Add transactions to unlock category insights.",
      tone: "primary",
    },
    {
      title: "Budget watch",
      value: overspentBudget ? `${Math.round(overspentBudget.progress)}%` : "On track",
      note: overspentBudget ? `${overspentBudget.category.name} is moving fastest.` : "No active budgets are loaded yet.",
      tone: overspentBudget && overspentBudget.progress > 100 ? "warning" : "success",
    },
    {
      title: "Month position",
      value: formatCurrency(netPosition),
      note: netPosition >= 0 ? "Income is still ahead of expenses this month." : "Expenses are currently ahead of income.",
      tone: netPosition >= 0 ? "success" : "warning",
    },
  ] as const;

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Insights" title="A deeper read on your month, without losing the calm." description="Review financial health, strongest signals, and the patterns driving your current forecast." />

      <div className="summary-grid summary-grid-auto">
        {highlightCards.map((card) => (
          <article className={`summary-card ${card.tone}`} key={card.title}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.note}</p>
          </article>
        ))}
      </div>

      <div className="two-column">
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

          <div className="insight-callout calm">
            <strong>Suggested next steps</strong>
            <ul className="compact-list">
              {((health?.suggestions?.length ?? 0) > 0 ? health?.suggestions ?? [] : ["You are in a steady spot. Keep logging transactions to sharpen the score."]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <ForecastBalanceChart data={forecastDaily} />
      </div>

      <div className="two-column">
        <CategorySpendChart data={categorySpendQuery.data ?? []} />
        <IncomeExpenseTrendChart data={groupedTrend} />
      </div>

      <div className="two-column">
        <div className="panel stack-md">
          <div className="section-title">Forecast takeaways</div>
          <div className="insight-grid">
            <article className="insight-card">
              <span>Projected month-end balance</span>
              <strong>{formatCurrency(forecastMonthQuery.data?.forecastedEndBalance ?? 0)}</strong>
            </article>
            <article className="insight-card">
              <span>Safe to spend per day</span>
              <strong>{formatCurrency(forecastMonthQuery.data?.safeToSpendPerDay ?? 0)}</strong>
            </article>
          </div>
          <div className="forecast-alerts">
            {(forecastMonthQuery.data?.warnings ?? ["Forecast data is still being prepared."]).map((warning) => (
              <div className={`forecast-alert ${warning.toLowerCase().includes("negative") || warning.toLowerCase().includes("low") ? "risk" : "calm"}`} key={warning}>
                {warning}
              </div>
            ))}
          </div>
        </div>

        <div className="panel stack-md">
          <div className="section-title">Continue into automation</div>
          <p className="panel-subtitle">Turn repeated patterns into saved rules and manage shared account access from the new V2 pages.</p>
          <div className="feature-link-grid">
            <Link className="feature-link-card" to="/rules">
              <strong>Rules Engine</strong>
              <p>Automate categorization, tags, and alert logic.</p>
            </Link>
            <Link className="feature-link-card" to="/shared-accounts">
              <strong>Shared Accounts</strong>
              <p>Organize account members and their access roles.</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
