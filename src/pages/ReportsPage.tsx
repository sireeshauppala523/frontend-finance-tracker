import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategorySpendChart, IncomeExpenseTrendChart } from "../components/charts/FinanceCharts";
import { PageHeader } from "../components/ui/PageHeader";
import { getAccountBalanceTrend, getCategorySpend, getIncomeVsExpense } from "../services/finance";
import { useUiStore } from "../store/uiStore";
import { formatCurrency, formatDate, toMonthLabel } from "../utils/format";

export function ReportsPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const showToast = useUiStore((state) => state.showToast);

  const categorySpendQuery = useQuery({ queryKey: ["report-category-spend", from, to], queryFn: () => getCategorySpend(from || undefined, to || undefined) });
  const incomeExpenseQuery = useQuery({ queryKey: ["report-income-expense", from, to], queryFn: () => getIncomeVsExpense(from || undefined, to || undefined) });
  const balancesQuery = useQuery({ queryKey: ["report-account-balances"], queryFn: getAccountBalanceTrend });

  const groupedTrend = Object.values((incomeExpenseQuery.data ?? []).reduce<Record<string, { label: string; income: number; expense: number }>>((acc, item) => {
    const key = `${item.year}-${item.month}`;
    if (!acc[key]) acc[key] = { label: toMonthLabel(item.year, item.month), income: 0, expense: 0 };
    if (item.type === "income") acc[key].income = item.amount;
    if (item.type === "expense") acc[key].expense = item.amount;
    return acc;
  }, {}));

  function exportCsv() {
    const rows = [
      ["Category", "Amount"],
      ...(categorySpendQuery.data ?? []).map((item) => [item.category, String(item.amount)]),
    ];

    if (rows.length <= 1) {
      showToast("There is no report data to export yet.", "error");
      return;
    }

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "category-spend-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Report exported successfully.");
  }

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Reports" title="Trend reporting without the clutter." description="Switch date ranges, compare income and expenses, and export a category-spend CSV from live API data." />

      <div className="panel filters">
        <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        <button className="secondary-button" onClick={exportCsv} type="button">Export CSV</button>
      </div>

      <div className="two-column">
        <CategorySpendChart data={categorySpendQuery.data ?? []} />
        <IncomeExpenseTrendChart data={groupedTrend} />
      </div>

      <div className="panel list">
        <div className="section-title">Account balances</div>
        {(balancesQuery.data ?? []).map((item) => (
          <div className="list-row" key={item.name}>
            <div>
              <strong>{item.name}</strong>
              <p>{formatDate(item.lastUpdatedAt)}</p>
            </div>
            <strong>{formatCurrency(item.currentBalance)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
