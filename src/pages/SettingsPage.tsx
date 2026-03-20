import { ChangeEvent, useEffect, useRef, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { UserAvatar } from "../components/ui/UserAvatar";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import type { SupportedCurrency } from "../types/api";

const currencyOptions: Array<{ value: SupportedCurrency; label: string }> = [
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "AED", label: "UAE Dirham (AED)" },
];

export function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, updateProfile, logout } = useAuthStore();
  const showToast = useUiStore((state) => state.showToast);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [preferredCurrency, setPreferredCurrency] = useState<SupportedCurrency>(user?.preferredCurrency ?? "INR");

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
    setPreferredCurrency(user?.preferredCurrency ?? "INR");
  }, [user?.displayName, user?.preferredCurrency]);

  function handleSave() {
    if (!displayName.trim()) {
      showToast("Please enter your display name.", "error");
      return;
    }

    try {
      updateProfile({ displayName: displayName.trim(), preferredCurrency });
      showToast("Changes saved successfully.");
    } catch {
      showToast("Unable to save changes right now.", "error");
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ avatarUrl: typeof reader.result === "string" ? reader.result : null });
      showToast("Profile image saved successfully.");
    };
    reader.onerror = () => {
      showToast("Unable to save the profile image right now.", "error");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <section className="stack-lg">
      <PageHeader eyebrow="Settings" title="Account, alerts, and profile preferences." description="Manage the visible name, profile picture, and account info for your current signed-in session." />

      <div className="panel profile-panel">
        <div className="profile-header">
          <button className="settings-avatar-button" type="button" onClick={handleAvatarClick} aria-label={user?.avatarUrl ? "Edit profile image" : "Upload profile image"}>
            <UserAvatar user={user} size={104} />
            <span className="settings-avatar-overlay">{user?.avatarUrl ? "Edit image" : "Upload image"}</span>
          </button>
          <div className="profile-meta">
            <strong className="profile-name">{user?.displayName ?? "Profile"}</strong>
            <p className="profile-email">{user?.email ?? ""}</p>
          </div>
        </div>

        <input ref={fileInputRef} className="visually-hidden" type="file" accept="image/*" onChange={handleFileChange} />

        <div className="profile-fields">
          <label className="settings-field">
            <span>Display name</span>
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>

          <label className="settings-field">
            <span>Email</span>
            <input value={user?.email ?? ""} readOnly />
          </label>

          <label className="settings-field">
            <span>Preferred currency</span>
            <select value={preferredCurrency} onChange={(event) => setPreferredCurrency(event.target.value as SupportedCurrency)}>
              {currencyOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="settings-actions">
          <button className="primary-button settings-button" type="button" onClick={handleSave}>Save Profile</button>
          <button className="secondary-button settings-button" type="button" onClick={logout}>Log Out</button>
        </div>
      </div>
    </section>
  );
}
