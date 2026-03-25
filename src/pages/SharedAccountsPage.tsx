import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "../components/ui/PageHeader";
import { addSharedAccountMember, getAccounts, getSharedAccounts, removeSharedAccountMember } from "../services/finance";
import type { SharedAccountMember } from "../types/api";
import { useUiStore } from "../store/uiStore";
import { formatCurrency } from "../utils/format";
import { getErrorMessage } from "../utils/errors";

export function SharedAccountsPage() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const accountsQuery = useQuery({ queryKey: ["accounts", "shared"], queryFn: getAccounts });
  const sharedAccountsQuery = useQuery({ queryKey: ["shared-accounts"], queryFn: getSharedAccounts });
  const [accountId, setAccountId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SharedAccountMember["role"]>("viewer");

  const addMemberMutation = useMutation({
    mutationFn: addSharedAccountMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setEmail("");
      setRole("viewer");
      showToast("Member access saved successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to save member access right now."), "error"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: removeSharedAccountMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      showToast("Member removed successfully.");
    },
    onError: (error) => showToast(getErrorMessage(error, "Unable to remove the member right now."), "error"),
  });

  useEffect(() => {
    if (!accountId && (accountsQuery.data?.length ?? 0) > 0) {
      const ownedAccount = accountsQuery.data?.find((account) => account.accessRole === "owner") ?? accountsQuery.data?.[0];
      setAccountId(ownedAccount?.id ?? "");
    }
  }, [accountId, accountsQuery.data]);

  const memberGroups = useMemo(() => sharedAccountsQuery.data ?? [], [sharedAccountsQuery.data]);
  const ownedAccounts = (accountsQuery.data ?? []).filter((account) => account.accessRole === "owner");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accountId || !email.trim()) {
      showToast("Please choose an account and enter a registered user email.", "error");
      return;
    }

    addMemberMutation.mutate({
      accountId,
      email: email.trim(),
      role,
    });
  }

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Shared Accounts" title="Family-mode account access with clear roles and ownership." description="Assign viewers, editors, and owners to the accounts you want to manage together." />

      <form className="panel form-grid" onSubmit={handleSubmit}>
        <div className="section-title">Add account member</div>
        <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
          <option value="">Select account</option>
          {ownedAccounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
        <input placeholder="Registered user email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <select value={role} onChange={(event) => setRole(event.target.value as SharedAccountMember["role"])}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={addMemberMutation.isPending}>
            {addMemberMutation.isPending ? "Saving..." : "Add Member"}
          </button>
        </div>
      </form>
      {ownedAccounts.length === 0 ? <div className="empty-state">You do not own any accounts yet, so there is nothing available to share from this profile.</div> : null}

      <div className="summary-grid summary-grid-auto">
        {(accountsQuery.data ?? []).map((account) => (
          <article className={`summary-card ${account.isShared ? "warning" : "primary"}`} key={account.id}>
            <span>{account.type}</span>
            <strong>{formatCurrency(account.currentBalance)}</strong>
            <p>{account.name}</p>
            <p>{account.accessRole ?? "owner"} access</p>
          </article>
        ))}
      </div>

      <div className="stack-md">
        {memberGroups.map((group) => (
          <div className="panel list" key={group.accountId}>
            <div className="section-title">{group.accountName}</div>
            {group.members.map((member) => (
              <div className="list-row list-row-actions" key={member.id}>
                <div>
                  <strong>{member.displayName}</strong>
                  <p>{member.email}</p>
                </div>
                <div className="list-actions">
                  <span className="pill green">{member.role}</span>
                  <button className="secondary-button" type="button" onClick={() => removeMemberMutation.mutate(member.id)} disabled={removeMemberMutation.isPending}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {group.members.length === 0 ? <div className="empty-state">No members added for this account yet.</div> : null}
          </div>
        ))}
        {sharedAccountsQuery.isLoading ? <div className="status-banner">Loading shared account members...</div> : null}
      </div>
    </section>
  );
}
