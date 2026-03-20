import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/ui/PageHeader";
import { contributeGoal, createGoal, deleteGoal, getAccounts, getGoals, updateGoal } from "../services/finance";
import { useUiStore } from "../store/uiStore";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, toIsoDate } from "../utils/format";
import type { GoalItem } from "../types/api";

type GoalFormState = {
  id: string | null;
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  linkedAccountId: string;
};

const initialForm: GoalFormState = {
  id: null,
  name: "",
  targetAmount: "",
  currentAmount: "0",
  targetDate: "",
  linkedAccountId: "",
};

export function GoalsPage() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [form, setForm] = useState<GoalFormState>(initialForm);
  const [contributions, setContributions] = useState<Record<string, string>>({});
  const [contributionErrors, setContributionErrors] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const goalsQuery = useQuery({ queryKey: ["goals"], queryFn: getGoals });

  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setForm(initialForm);
      showToast("Goal saved successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to save goal right now."), "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ goalId, payload }: { goalId: string; payload: Parameters<typeof updateGoal>[1] }) => updateGoal(goalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setForm(initialForm);
      setOpenMenuId(null);
      showToast("Goal updated successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to update goal right now."), "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setForm(initialForm);
      setOpenMenuId(null);
      showToast("Goal deleted successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to delete goal right now."), "error");
    },
  });

  const contributeMutation = useMutation({
    mutationFn: ({ goalId, amount, sourceAccountId }: { goalId: string; amount: number; sourceAccountId?: string | null }) =>
      contributeGoal(goalId, { amount, sourceAccountId: sourceAccountId ?? null }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setContributions((current) => ({ ...current, [variables.goalId]: "" }));
      setContributionErrors((current) => ({ ...current, [variables.goalId]: "" }));
      showToast("Contribution added successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to add contribution right now."), "error");
    },
  });

  useEffect(() => {
    function handleCloseMenu() {
      setOpenMenuId(null);
    }

    window.addEventListener("click", handleCloseMenu);
    return () => window.removeEventListener("click", handleCloseMenu);
  }, []);

  function buildPayload() {
    return {
      name: form.name.trim(),
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount),
      targetDate: form.targetDate || null,
      linkedAccountId: form.linkedAccountId || null,
      icon: "target",
      color: "#2F7A5C",
      status:
        Number(form.currentAmount) >= Number(form.targetAmount || 0) && Number(form.targetAmount || 0) > 0
          ? "completed"
          : "active",
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast("Please enter a goal name.", "error");
      return;
    }

    if (!form.targetAmount || Number(form.targetAmount) <= 0) {
      showToast("Please enter a target amount greater than 0.", "error");
      return;
    }

    if (form.currentAmount === "" || Number(form.currentAmount) < 0) {
      showToast("Please enter a current amount of 0 or more.", "error");
      return;
    }

    if (form.id) {
      updateMutation.mutate({ goalId: form.id, payload: buildPayload() });
      return;
    }

    createMutation.mutate(buildPayload());
  }

  function handleEdit(goal: GoalItem) {
    setForm({
      id: goal.id,
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : "",
      linkedAccountId: goal.linkedAccountId ?? "",
    });
    setOpenMenuId(null);
  }

  function handleDelete(goalId: string) {
    deleteMutation.mutate(goalId);
  }

  function handleCancelEdit() {
    setForm(initialForm);
  }

  function handleContributionChange(goalId: string, value: string) {
    setContributions((current) => ({ ...current, [goalId]: value }));
    setContributionErrors((current) => ({ ...current, [goalId]: "" }));
  }

  function handleContributionSubmit(goalId: string, sourceAccountId?: string | null) {
    const rawValue = contributions[goalId] ?? "";
    const amount = Number(rawValue);

    if (!rawValue || Number.isNaN(amount) || amount <= 0) {
      setContributionErrors((current) => ({ ...current, [goalId]: "Enter an amount greater than 0." }));
      return;
    }

    contributeMutation.mutate({ goalId, amount, sourceAccountId });
  }

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Goals" title="Savings goals with visible momentum." description="Create targets, add contributions, and keep each milestone easy to understand." />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-title">{form.id ? "Edit goal" : "Add goal"}</div>
        <input placeholder="Goal name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input type="number" min="1" step="0.01" placeholder="Target amount" value={form.targetAmount} onChange={(event) => setForm({ ...form, targetAmount: event.target.value })} required />
        <input type="number" min="0" step="0.01" placeholder="Current amount" value={form.currentAmount} onChange={(event) => setForm({ ...form, currentAmount: event.target.value })} required />
        <input type="date" value={form.targetDate} min={toIsoDate(new Date())} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
        <select value={form.linkedAccountId} onChange={(event) => setForm({ ...form, linkedAccountId: event.target.value })}>
          <option value="">No linked account</option>
          {(accountsQuery.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : form.id ? "Update Goal" : "Save Goal"}
          </button>
          {form.id ? <button className="secondary-button" type="button" onClick={handleCancelEdit}>Cancel</button> : null}
        </div>
      </form>

      <div className="goal-grid">
        {(goalsQuery.data ?? []).map((goal) => {
          const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          const menuOpen = openMenuId === goal.id;

          return (
            <article className="goal-card" key={goal.id}>
              <div className="goal-header goal-card-top">
                <div>
                  <strong>{goal.name}</strong>
                  <span>{goal.targetDate ? formatDate(goal.targetDate) : "No deadline"}</span>
                </div>
                <div className="goal-menu-wrap" onClick={(event) => event.stopPropagation()}>
                  <button className="goal-menu-button" type="button" onClick={() => setOpenMenuId(menuOpen ? null : goal.id)} aria-label="Goal options">
                    <span />
                    <span />
                    <span />
                  </button>
                  {menuOpen ? (
                    <div className="goal-menu-dropdown">
                      <button type="button" onClick={() => handleEdit(goal)}>Edit</button>
                      <button type="button" className="danger-text" onClick={() => handleDelete(goal.id)}>Delete</button>
                    </div>
                  ) : null}
                </div>
              </div>
              <p>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <small>{progress}% complete</small>
              <div className="inline-form contribution-block">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Contribution"
                  value={contributions[goal.id] ?? ""}
                  onChange={(event) => handleContributionChange(goal.id, event.target.value)}
                />
                <button
                  className="secondary-button"
                  onClick={() => handleContributionSubmit(goal.id, goal.linkedAccountId)}
                  type="button"
                >
                  Add
                </button>
              </div>
              {contributionErrors[goal.id] ? <div className="field-error">{contributionErrors[goal.id]}</div> : null}
            </article>
          );
        })}
      </div>
      {goalsQuery.data?.length === 0 ? <div className="empty-state">No goals yet. Create your first one above.</div> : null}
    </section>
  );
}
