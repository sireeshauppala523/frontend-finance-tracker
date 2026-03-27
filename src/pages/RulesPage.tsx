import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/ui/PageHeader";
import { createRule, deleteRule, getCategorySpend, getDashboardSummary, getRules, updateRule } from "../services/finance";
import type { AutomationRule } from "../types/api";
import { useUiStore } from "../store/uiStore";
import { formatCurrency } from "../utils/format";
import { getErrorMessage } from "../utils/errors";

const samplePresets = [
  { name: "Large payment alert", field: "amount", operator: "greaterThan", value: "5000", actionType: "alert", actionValue: "High-value expense needs review" },
  { name: "Uber to transport", field: "merchant", operator: "contains", value: "Uber", actionType: "categorize", actionValue: "Transport" },
  { name: "Food tag helper", field: "category", operator: "equals", value: "Food", actionType: "tag", actionValue: "monthly-food" },
] as const;

const operatorOptions: Record<AutomationRule["condition"]["field"], AutomationRule["condition"]["operator"][]> = {
  merchant: ["contains", "equals"],
  category: ["contains", "equals"],
  amount: ["greaterThan", "lessThan", "equals"],
};

const actionValueGuidance: Record<AutomationRule["action"]["type"], { placeholder: string; helper: string }> = {
  categorize: {
    placeholder: "Transport",
    helper: 'Enter the category name to assign when the rule matches, for example "Transport".',
  },
  tag: {
    placeholder: "monthly-food",
    helper: 'Enter a tag label to add when the rule matches, for example "monthly-food".',
  },
  alert: {
    placeholder: "High-value expense needs review",
    helper: "Enter the alert message that should be shown when the rule matches.",
  },
};

export function RulesPage() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [name, setName] = useState("");
  const [field, setField] = useState<AutomationRule["condition"]["field"]>("merchant");
  const [operator, setOperator] = useState<AutomationRule["condition"]["operator"]>("contains");
  const [conditionValue, setConditionValue] = useState("");
  const [actionType, setActionType] = useState<AutomationRule["action"]["type"]>("categorize");
  const [actionValue, setActionValue] = useState("");

  const rulesQuery = useQuery({ queryKey: ["rules"], queryFn: getRules });
  const summaryQuery = useQuery({ queryKey: ["dashboard-summary", "rules"], queryFn: getDashboardSummary });
  const categorySpendQuery = useQuery({ queryKey: ["category-spend", "rules"], queryFn: () => getCategorySpend() });
  const availableOperators = operatorOptions[field];
  const actionInputCopy = actionValueGuidance[actionType];

  useEffect(() => {
    if (!availableOperators.includes(operator)) {
      setOperator(availableOperators[0]);
    }
  }, [availableOperators, operator]);

  const createMutation = useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      resetForm();
      showToast("Rule saved successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to save the rule right now."), "error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; name: string; condition: AutomationRule["condition"]; action: AutomationRule["action"]; isActive: boolean }) =>
      updateRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      showToast("Rule updated successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to update the rule right now."), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      showToast("Rule removed successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to remove the rule right now."), "error"),
  });

  const evaluations = useMemo(() => {
    const sampleMerchant = summaryQuery.data?.recentTransactions[0]?.merchant ?? "Uber";
    const sampleAmount = Math.max(...(summaryQuery.data?.recentTransactions.map((item) => item.amount) ?? [0]));
    const sampleCategory = [...(categorySpendQuery.data ?? [])].sort((left, right) => right.amount - left.amount)[0]?.category ?? "Food";

    return (rulesQuery.data ?? []).map((rule) => {
      let matched = false;
      if (rule.condition.field === "merchant") {
        const value = sampleMerchant.toLowerCase();
        const target = rule.condition.value.toLowerCase();
        matched = rule.condition.operator === "equals" ? value === target : value.includes(target);
      }
      if (rule.condition.field === "category") {
        const value = sampleCategory.toLowerCase();
        const target = rule.condition.value.toLowerCase();
        matched = rule.condition.operator === "equals" ? value === target : value.includes(target);
      }
      if (rule.condition.field === "amount") {
        const target = Number(rule.condition.value);
        matched = rule.condition.operator === "greaterThan" ? sampleAmount > target : sampleAmount < target;
      }

      const preview = rule.condition.field === "amount"
        ? `Largest recent transaction: ${formatCurrency(sampleAmount)}`
        : rule.condition.field === "category"
          ? `Top spend category: ${sampleCategory}`
          : `Latest merchant sample: ${sampleMerchant}`;

      return { rule, matched, preview };
    });
  }, [categorySpendQuery.data, rulesQuery.data, summaryQuery.data?.recentTransactions]);

  function resetForm() {
    setName("");
    setField("merchant");
    setOperator("contains");
    setConditionValue("");
    setActionType("categorize");
    setActionValue("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !conditionValue.trim() || !actionValue.trim()) {
      showToast("Please complete the rule name, condition, and action fields.", "error");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      condition: { field, operator, value: conditionValue.trim() },
      action: { type: actionType, value: actionValue.trim() },
      isActive: true,
    });
  }

  function applyPreset(index: number) {
    const preset = samplePresets[index];
    setName(preset.name);
    setField(preset.field as AutomationRule["condition"]["field"]);
    setOperator(preset.operator as AutomationRule["condition"]["operator"]);
    setConditionValue(preset.value);
    setActionType(preset.actionType as AutomationRule["action"]["type"]);
    setActionValue(preset.actionValue);
  }

  function toggleRule(rule: AutomationRule) {
    updateMutation.mutate({
      id: rule.id,
      name: rule.name,
      condition: rule.condition,
      action: rule.action,
      isActive: !rule.isActive,
    });
  }

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Rules Engine" title="Automate the nudges and organization you repeat every month." description="Create server-backed rules for categorization, tagging, and alerts, with live previews against current finance data." />

      <div className="panel stack-md">
        <div className="section-title">Starter presets</div>
        <div className="feature-link-grid">
          {samplePresets.map((preset, index) => (
            <button className="feature-link-card feature-link-button" key={preset.name} type="button" onClick={() => applyPreset(index)}>
              <strong>{preset.name}</strong>
              <p>{preset.field} {preset.operator} {preset.value}</p>
            </button>
          ))}
        </div>
      </div>

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-title">Create automation rule</div>
        <input placeholder="Rule name" value={name} onChange={(event) => setName(event.target.value)} />
        <select value={field} onChange={(event) => setField(event.target.value as AutomationRule["condition"]["field"])}>
          <option value="merchant">Merchant</option>
          <option value="amount">Amount</option>
          <option value="category">Category</option>
        </select>
        <select value={operator} onChange={(event) => setOperator(event.target.value as AutomationRule["condition"]["operator"])}>
          {availableOperators.map((item) => (
            <option key={item} value={item}>
              {item === "greaterThan" ? "greater than" : item === "lessThan" ? "less than" : item}
            </option>
          ))}
        </select>
        <input placeholder="Condition value" value={conditionValue} onChange={(event) => setConditionValue(event.target.value)} />
        <select value={actionType} onChange={(event) => setActionType(event.target.value as AutomationRule["action"]["type"])}>
          <option value="categorize">Categorize as</option>
          <option value="tag">Add tag</option>
          <option value="alert">Trigger alert</option>
        </select>
        <div className="stack-md">
          <input placeholder={actionInputCopy.placeholder} value={actionValue} onChange={(event) => setActionValue(event.target.value)} />
          <p className="rule-field-helper">{actionInputCopy.helper}</p>
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save Rule"}</button>
        </div>
      </form>

      <div className="panel list">
        <div className="section-title">Saved rules</div>
        {evaluations.map(({ rule, matched, preview }) => (
          <div className="list-row list-row-actions" key={rule.id}>
            <div>
              <strong>{rule.name}</strong>
              <p>If {rule.condition.field} {rule.condition.operator} "{rule.condition.value}" then {rule.action.type} "{rule.action.value}"</p>
              <p>{preview}</p>
            </div>
            <div className="list-actions">
              <span className={`pill ${matched ? "green" : "amber"}`}>{matched ? "Matched" : "Idle"}</span>
              <button className="secondary-button rule-action-button" type="button" onClick={() => toggleRule(rule)} disabled={updateMutation.isPending}>
                {rule.isActive ? "Pause" : "Activate"}
              </button>
              <button className="secondary-button rule-action-button" type="button" onClick={() => deleteMutation.mutate(rule.id)} disabled={deleteMutation.isPending}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {rulesQuery.isLoading ? <div className="status-banner">Loading rules...</div> : null}
        {evaluations.length === 0 && !rulesQuery.isLoading ? <div className="empty-state">No rules saved yet. Start with one of the presets above or create your own.</div> : null}
      </div>
    </section>
  );
}
