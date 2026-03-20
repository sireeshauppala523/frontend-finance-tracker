import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/ui/PageHeader";
import { createBudget, getBudgets, getCategories } from "../services/finance";
import { useUiStore } from "../store/uiStore";
import { getErrorMessage } from "../utils/errors";

const today = new Date();
const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const yearOptions = Array.from({ length: 8 }, (_, index) => today.getFullYear() - 2 + index);

export function BudgetsPage() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [threshold, setThreshold] = useState("80");

  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const budgetsQuery = useQuery({ queryKey: ["budgets", month, year], queryFn: () => getBudgets(month, year) });

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", month, year] });
      setAmount("");
      setCategoryId("");
      showToast("Budget saved successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to save budget right now."), "error");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      showToast("Please select a category.", "error");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      showToast("Please enter a budget amount greater than 0.", "error");
      return;
    }

    if (!threshold || Number(threshold) <= 0) {
      showToast("Please choose a valid alert threshold.", "error");
      return;
    }

    createMutation.mutate({
      categoryId,
      month,
      year,
      amount: Number(amount),
      alertThresholdPercent: Number(threshold),
    });
  }

  const expenseCategories = (categoriesQuery.data ?? []).filter((item) => item.type === "expense");

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Budgets" title="Monthly guardrails with clear over-budget signals." description="Create budgets for each category and compare them with actual spending in real time." />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-title">Set budget</div>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
          <option value="">Select category</option>
          {expenseCategories.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input type="number" min="1" step="0.01" placeholder="Budget amount" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
          {monthOptions.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
          {yearOptions.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select value={threshold} onChange={(event) => setThreshold(event.target.value)}>
          <option value="80">80%</option>
          <option value="100">100%</option>
          <option value="120">120%</option>
        </select>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save Budget"}</button>
        </div>
      </form>

      <div className="panel stack-md">
        {(budgetsQuery.data ?? []).map((budget) => {
          const progress = Math.round(budget.progress);
          return (
            <div className="budget-row" key={budget.id}>
              <div className="budget-copy">
                <strong>{budget.category?.name ?? "Category"}</strong>
                <span>{budget.spent.toFixed(2)} / {budget.amount.toFixed(2)}</span>
              </div>
              <div className="progress-track">
                <div className={`progress-fill ${progress >= 100 ? "danger" : ""}`} style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <strong>{progress}%</strong>
            </div>
          );
        })}
        {budgetsQuery.isLoading ? <div className="status-banner">Loading budgets...</div> : null}
        {budgetsQuery.data?.length === 0 ? <div className="empty-state">No budgets found for this month. Create one above.</div> : null}
      </div>
    </section>
  );
}
