import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/ui/PageHeader";
import { createRecurring, getAccounts, getCategories, getRecurring } from "../services/finance";
import { useUiStore } from "../store/uiStore";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, toIsoDate } from "../utils/format";

export function RecurringPage() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(toIsoDate(new Date()));

  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const recurringQuery = useQuery({ queryKey: ["recurring"], queryFn: getRecurring });
  const editableAccounts = (accountsQuery.data ?? []).filter((item) => item.accessRole !== "viewer");

  const createMutation = useMutation({
    mutationFn: createRecurring,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setTitle("");
      setAmount("");
      setCategoryId("");
      showToast("Recurring item saved successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to save recurring item right now."), "error");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      showToast("Please enter a title for the recurring item.", "error");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      showToast("Please enter an amount greater than 0.", "error");
      return;
    }

    if (!accountId) {
      showToast("Please select an account.", "error");
      return;
    }

    if (!startDate) {
      showToast("Please choose a start date.", "error");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      type,
      amount: Number(amount),
      categoryId: categoryId || null,
      accountId: accountId || null,
      frequency,
      startDate,
      endDate: null,
      nextRunDate: startDate,
      autoCreateTransaction: true,
      isPaused: false,
    });
  }

  const relevantCategories = (categoriesQuery.data ?? []).filter((item) => item.type === type);

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Recurring" title="Upcoming bills and subscriptions, kept in one place." description="Create recurring salaries, subscriptions, and bills that feed the dashboard." />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-title">New recurring item</div>
        <input placeholder="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        <select value={accountId} onChange={(event) => setAccountId(event.target.value)} required>
          <option value="">Select account</option>
          {editableAccounts.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">Select category</option>
          {relevantCategories.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select value={frequency} onChange={(event) => setFrequency(event.target.value)}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save Recurring Item"}</button>
        </div>
      </form>

      <div className="panel list">
        {(recurringQuery.data ?? []).map((item) => (
          <div className="list-row" key={item.id}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.frequency}</p>
            </div>
            <div className="align-right">
              <strong>{formatCurrency(item.amount)}</strong>
              <p>{formatDate(item.nextRunDate)}</p>
            </div>
          </div>
        ))}
        {recurringQuery.data?.length === 0 ? <div className="empty-state">No recurring items yet.</div> : null}
      </div>
    </section>
  );
}
