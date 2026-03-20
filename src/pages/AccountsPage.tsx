import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/ui/PageHeader";
import { createAccount, getAccountBalanceTrend, getAccounts, getCategorySpend, getIncomeVsExpense, transferFunds } from "../services/finance";
import { useUiStore } from "../store/uiStore";
import { getErrorMessage } from "../utils/errors";
import { CategorySpendChart, IncomeExpenseTrendChart } from "../components/charts/FinanceCharts";
import { formatCurrency, formatDate, toIsoDate, toMonthLabel } from "../utils/format";

export function AccountsPage() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [name, setName] = useState("");
  const [type, setType] = useState("bank account");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [institutionName, setInstitutionName] = useState("");
  const [sourceAccountId, setSourceAccountId] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDate, setTransferDate] = useState(toIsoDate(new Date()));
  const [transferNote, setTransferNote] = useState("");

  const accountsQuery = useQuery({ queryKey: ["accounts"], queryFn: getAccounts });
  const balanceTrendQuery = useQuery({ queryKey: ["account-balance-trend"], queryFn: getAccountBalanceTrend });
  const categorySpendQuery = useQuery({ queryKey: ["category-spend", "accounts"], queryFn: () => getCategorySpend() });
  const incomeExpenseQuery = useQuery({ queryKey: ["income-expense", "accounts"], queryFn: () => getIncomeVsExpense() });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account-balance-trend"] });
      setName("");
      setInstitutionName("");
      setOpeningBalance("0");
      showToast("Account saved successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to save account right now."), "error");
    },
  });

  const transferMutation = useMutation({
    mutationFn: transferFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["account-balance-trend"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
      setTransferAmount("");
      setTransferNote("");
      showToast("Funds transferred successfully.");
    },
    onError: (error) => {
      showToast(getErrorMessage(error, "Unable to process the transfer right now."), "error");
    },
  });

  const groupedTrend = Object.values(
    (incomeExpenseQuery.data ?? []).reduce<Record<string, { label: string; income: number; expense: number }>>((acc, item) => {
      const key = `${item.year}-${item.month}`;
      if (!acc[key]) acc[key] = { label: toMonthLabel(item.year, item.month), income: 0, expense: 0 };
      if (item.type === "income") acc[key].income = item.amount;
      if (item.type === "expense") acc[key].expense = item.amount;
      return acc;
    }, {}),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      showToast("Please enter an account name.", "error");
      return;
    }

    if (openingBalance === "" || Number.isNaN(Number(openingBalance))) {
      showToast("Please enter a valid opening balance.", "error");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      type,
      openingBalance: Number(openingBalance),
      institutionName: institutionName.trim(),
    });
  }

  function handleTransfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sourceAccountId || !destinationAccountId) {
      showToast("Please choose both source and destination accounts.", "error");
      return;
    }

    if (sourceAccountId === destinationAccountId) {
      showToast("Please choose two different accounts for the transfer.", "error");
      return;
    }

    if (!transferAmount || Number(transferAmount) <= 0) {
      showToast("Please enter a transfer amount greater than 0.", "error");
      return;
    }

    if (!transferDate) {
      showToast("Please choose a transfer date.", "error");
      return;
    }

    transferMutation.mutate({
      sourceAccountId,
      destinationAccountId,
      amount: Number(transferAmount),
      date: transferDate,
      note: transferNote.trim(),
    });
  }

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Accounts" title="Balances across every wallet, card, and bank account." description="Create accounts, move money between them, and review live balance positions." />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-title">Add account</div>
        <input placeholder="Account name" value={name} onChange={(event) => setName(event.target.value)} required />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="bank account">Bank account</option>
          <option value="credit card">Credit card</option>
          <option value="cash wallet">Cash wallet</option>
          <option value="savings account">Savings account</option>
        </select>
        <input type="number" step="0.01" placeholder="Opening balance" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value)} required />
        <input placeholder="Institution name" value={institutionName} onChange={(event) => setInstitutionName(event.target.value)} />
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? "Saving..." : "Save Account"}</button>
        </div>
      </form>

      <form className="panel form-grid" onSubmit={handleTransfer}>
        <div className="section-title">Transfer funds</div>
        <select value={sourceAccountId} onChange={(event) => setSourceAccountId(event.target.value)} required>
          <option value="">Source account</option>
          {(accountsQuery.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <select value={destinationAccountId} onChange={(event) => setDestinationAccountId(event.target.value)} required>
          <option value="">Destination account</option>
          {(accountsQuery.data ?? []).map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
        <input type="number" min="0.01" step="0.01" placeholder="Amount" value={transferAmount} onChange={(event) => setTransferAmount(event.target.value)} required />
        <input type="date" value={transferDate} onChange={(event) => setTransferDate(event.target.value)} required />
        <input placeholder="Note" value={transferNote} onChange={(event) => setTransferNote(event.target.value)} />
        <div className="form-actions">
          <button className="secondary-button" type="submit" disabled={transferMutation.isPending}>{transferMutation.isPending ? "Moving..." : "Transfer"}</button>
        </div>
      </form>

      <div className="summary-grid">
        {(accountsQuery.data ?? []).map((account) => (
          <article className="summary-card primary" key={account.id}>
            <span>{account.type}</span>
            <strong>{formatCurrency(account.currentBalance)}</strong>
            <p>{account.name}</p>
          </article>
        ))}
      </div>

      <div className="two-column">
        <div className="panel list">
          <div className="section-title">Balance trend snapshot</div>
          {(balanceTrendQuery.data ?? []).map((item) => (
            <div className="list-row" key={item.name}>
              <div>
                <strong>{item.name}</strong>
                <p>Updated {formatDate(item.lastUpdatedAt)}</p>
              </div>
              <strong>{formatCurrency(item.currentBalance)}</strong>
            </div>
          ))}
        </div>
        <CategorySpendChart data={categorySpendQuery.data ?? []} />
      </div>

      <IncomeExpenseTrendChart data={groupedTrend} />
    </section>
  );
}
