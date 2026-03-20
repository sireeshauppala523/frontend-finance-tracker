import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/ui/PageHeader";
import {
  createCategory,
  createTransaction,
  deleteCategory,
  deleteTransaction,
  getAccounts,
  getCategories,
  getTransactions,
  updateCategory,
  updateTransaction,
} from "../services/finance";
import { useUiStore } from "../store/uiStore";
import { getErrorMessage } from "../utils/errors";
import { formatCurrency, formatDate, toIsoDate } from "../utils/format";
import type { Category, TransactionItem } from "../types/api";

type TransactionFormState = {
  id: string | null;
  accountId: string;
  categoryId: string;
  type: "expense" | "income";
  amount: string;
  date: string;
  merchant: string;
  note: string;
};

type CategoryFormState = {
  id: string | null;
  name: string;
  type: "expense" | "income";
  color: string;
};

type ActionIconButtonProps = {
  label: string;
  variant?: "default" | "danger";
  onClick: () => void;
};

const initialTransactionForm: TransactionFormState = {
  id: null,
  accountId: "",
  categoryId: "",
  type: "expense",
  amount: "",
  date: toIsoDate(new Date()),
  merchant: "",
  note: "",
};

const initialCategoryForm: CategoryFormState = {
  id: null,
  name: "",
  type: "expense",
  color: "#4F7CAC",
};

function ActionIconButton({ label, variant = "default", onClick }: ActionIconButtonProps) {
  const isDanger = variant === "danger";

  return (
    <button
      className={`table-action-button ${isDanger ? "danger" : ""}`}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {isDanger ? (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="table-action-icon">
          <path d="M9 3h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4 7h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 11v5M14 11v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="table-action-icon">
          <path d="M4 20l4.5-1 9.3-9.3a1.7 1.7 0 0 0 0-2.4l-1.1-1.1a1.7 1.7 0 0 0-2.4 0L5 15.5 4 20z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.5 7.5l3 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <span className="table-action-label">{label}</span>
    </button>
  );
}

export function TransactionsPage() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [form, setForm] = useState<TransactionFormState>(initialTransactionForm);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(initialCategoryForm);

  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: getCategories });
  const transactionsQuery = useQuery({
    queryKey: ["transactions", { search, type, categoryId, accountId }],
    queryFn: () =>
      getTransactions({
        search: search || undefined,
        type: type || undefined,
        categoryId: categoryId || undefined,
        accountId: accountId || undefined,
      }),
  });

  const filteredCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((item) => item.type === form.type && !item.isArchived),
    [categoriesQuery.data, form.type],
  );

  const editableCategories = useMemo(
    () => (categoriesQuery.data ?? []).filter((item) => item.userId),
    [categoriesQuery.data],
  );

  const createTransactionMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setForm(initialTransactionForm);
      showToast("Transaction saved successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to save transaction right now."), "error"),
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ transactionId, payload }: { transactionId: string; payload: Parameters<typeof updateTransaction>[1] }) =>
      updateTransaction(transactionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setForm(initialTransactionForm);
      showToast("Transaction updated successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to update transaction right now."), "error"),
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      if (form.id) {
        setForm(initialTransactionForm);
      }
      showToast("Transaction deleted successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to delete transaction right now."), "error"),
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryForm(initialCategoryForm);
      showToast("Category saved successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to save category right now."), "error"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId: id, payload }: { categoryId: string; payload: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setCategoryForm(initialCategoryForm);
      showToast("Category updated successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to update category right now."), "error"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setCategoryForm(initialCategoryForm);
      if (form.categoryId && !editableCategories.some((item) => item.id === form.categoryId)) {
        setForm((current) => ({ ...current, categoryId: "" }));
      }
      showToast("Category deleted successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to delete category right now."), "error"),
  });

  function buildTransactionPayload() {
    return {
      accountId: form.accountId,
      categoryId: form.categoryId,
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
      merchant: form.merchant.trim(),
      note: form.note.trim(),
      paymentMethod: "manual",
      tags: [],
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.accountId) {
      showToast("Please select an account.", "error");
      return;
    }

    if (!form.categoryId) {
      showToast("Please select a category.", "error");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      showToast("Please enter an amount greater than 0.", "error");
      return;
    }

    if (!form.date) {
      showToast("Please choose a transaction date.", "error");
      return;
    }

    if (form.id) {
      updateTransactionMutation.mutate({ transactionId: form.id, payload: buildTransactionPayload() });
      return;
    }

    createTransactionMutation.mutate(buildTransactionPayload());
  }

  function handleEditTransaction(item: TransactionItem) {
    setForm({
      id: item.id,
      accountId: item.accountId,
      categoryId: item.categoryId ?? "",
      type: item.type === "income" ? "income" : "expense",
      amount: String(item.amount),
      date: item.transactionDate,
      merchant: item.merchant ?? "",
      note: item.note ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDeleteTransaction(transactionId: string) {
    deleteTransactionMutation.mutate(transactionId);
  }

  function handleCancelTransactionEdit() {
    setForm(initialTransactionForm);
  }

  function handleSubmitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      showToast("Please enter a category name.", "error");
      return;
    }

    const payload = {
      name: categoryForm.name.trim(),
      type: categoryForm.type,
      color: categoryForm.color,
      icon: "circle",
      isArchived: false,
    };

    if (categoryForm.id) {
      updateCategoryMutation.mutate({ categoryId: categoryForm.id, payload });
      return;
    }

    createCategoryMutation.mutate(payload);
  }

  function handleEditCategory(item: Category) {
    setCategoryForm({
      id: item.id,
      name: item.name,
      type: item.type === "income" ? "income" : "expense",
      color: item.color || "#4F7CAC",
    });
  }

  function handleDeleteCategory(categoryIdToDelete: string) {
    deleteCategoryMutation.mutate(categoryIdToDelete);
  }

  function handleCancelCategoryEdit() {
    setCategoryForm(initialCategoryForm);
  }

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Transactions" title="Fast entry, clean review, and flexible filters." description="Add and review income and expenses with live data. Account-to-account transfers are available on the Accounts screen." />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-title">{form.id ? "Edit transaction" : "Add transaction"}</div>
        <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as "expense" | "income", categoryId: "" })}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
        <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
        <select value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })} required>
          <option value="">Select account</option>
          {(accountsQuery.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
          <option value="">Select category</option>
          {filteredCategories.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input placeholder="Merchant" value={form.merchant} onChange={(event) => setForm({ ...form, merchant: event.target.value })} />
        <input placeholder="Note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={createTransactionMutation.isPending || updateTransactionMutation.isPending}>
            {createTransactionMutation.isPending || updateTransactionMutation.isPending ? "Saving..." : form.id ? "Update Transaction" : "Save Transaction"}
          </button>
          {form.id ? <button className="secondary-button" type="button" onClick={handleCancelTransactionEdit}>Cancel</button> : null}
        </div>
      </form>

      <div className="panel filters">
        <input placeholder="Search merchant or note" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All Types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
          <option value="transfer">Transfer</option>
        </select>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
          <option value="">All Categories</option>
          {(categoriesQuery.data ?? []).filter((item) => !item.isArchived).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
          <option value="">All Accounts</option>
          {(accountsQuery.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>

      <div className="panel stack-md">
        <div className="section-title">Saved transactions</div>
        <div className="table">
          <div className="table-row table-head transaction-table-head">
            <span>Date</span>
            <span>Merchant</span>
            <span>Category</span>
            <span>Account</span>
            <span>Type</span>
            <span>Amount</span>
            <span>Actions</span>
          </div>
          {(transactionsQuery.data ?? []).map((item) => (
            <div className="table-row transaction-table-row" key={item.id}>
              <span>{formatDate(item.transactionDate)}</span>
              <span>{item.merchant ?? "-"}</span>
              <span>{item.category?.name ?? "-"}</span>
              <span>{item.account?.name ?? "-"}</span>
              <span>{item.type}</span>
              <span>{formatCurrency(item.amount)}</span>
              <span className="table-actions">
                <ActionIconButton label="Edit transaction" onClick={() => handleEditTransaction(item)} />
                <ActionIconButton label="Delete transaction" variant="danger" onClick={() => handleDeleteTransaction(item.id)} />
              </span>
            </div>
          ))}
        </div>
        {transactionsQuery.isLoading ? <div className="status-banner">Loading transactions...</div> : null}
        {transactionsQuery.data?.length === 0 ? <div className="empty-state">No transactions match the current filters.</div> : null}
      </div>

      <div className="two-column transactions-management-grid">
        <form className="panel form-grid" onSubmit={handleSubmitCategory}>
          <div className="section-title">{categoryForm.id ? "Edit category" : "Manage categories"}</div>
          <input placeholder="Category name" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} required />
          <select value={categoryForm.type} onChange={(event) => setCategoryForm({ ...categoryForm, type: event.target.value as "expense" | "income" })}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <input type="color" value={categoryForm.color} onChange={(event) => setCategoryForm({ ...categoryForm, color: event.target.value })} aria-label="Choose category color" />
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
              {createCategoryMutation.isPending || updateCategoryMutation.isPending ? "Saving..." : categoryForm.id ? "Update Category" : "Save Category"}
            </button>
            {categoryForm.id ? <button className="secondary-button" type="button" onClick={handleCancelCategoryEdit}>Cancel</button> : null}
          </div>
        </form>

        <div className="panel stack-md">
          <div className="section-title">Saved categories</div>
          <div className="category-list">
            {(categoriesQuery.data ?? []).filter((item) => !item.isArchived).map((item) => {
              const isCustom = Boolean(item.userId);
              return (
                <div className="category-list-row" key={item.id}>
                  <div className="category-list-copy">
                    <span className="category-color-dot" style={{ background: item.color || "#4F7CAC" }} />
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.type} | {isCustom ? "custom" : "default"}</p>
                    </div>
                  </div>
                  <div className="table-actions">
                    {isCustom ? (
                      <>
                        <ActionIconButton label="Edit category" onClick={() => handleEditCategory(item)} />
                        <ActionIconButton label="Delete category" variant="danger" onClick={() => handleDeleteCategory(item.id)} />
                      </>
                    ) : (
                      <span className="category-readonly-chip">Default</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {categoriesQuery.data?.length === 0 ? <div className="empty-state">No categories found yet.</div> : null}
        </div>
      </div>
    </section>
  );
}
