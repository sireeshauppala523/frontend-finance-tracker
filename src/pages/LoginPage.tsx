import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "../components/ui/BrandLogo";
import { login, register } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { getErrorMessage } from "../utils/errors";
import type { SupportedCurrency } from "../types/api";

const highlights = [
  { value: "Budgets", note: "Set category-wise monthly limits and track actual spend.", tone: "budget" },
  { value: "Goals", note: "Build savings targets with visible progress and momentum.", tone: "goal" },
  { value: "Reports", note: "See trends, recurring bills, balances, and category breakdowns.", tone: "report" },
] as const;

const promptSteps = [
  "Return to your dashboard if you already track here.",
  "Create your account if you are starting a calmer money routine.",
  "Use the top-right action that matches your next step.",
];

const featurePoints = [
  "Fast daily transaction entry",
  "Clear monthly budget checkpoints",
  "Progress-aware savings goals",
] as const;

const featureStats = [
  { label: "Desktop", value: "Focused overview" },
  { label: "Mobile", value: "Quick updates" },
  { label: "Reports", value: "Useful patterns" },
] as const;

const featureBars = [38, 58, 44, 70, 54] as const;

const currencyOptions: Array<{ value: SupportedCurrency; label: string }> = [
  { value: "INR", label: "Indian Rupee (INR)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "AED", label: "UAE Dirham (AED)" },
];

export function LoginPage() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [mode, setMode] = useState<"login" | "register" | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState<SupportedCurrency>("INR");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openAuth(nextMode: "login" | "register") {
    setMode(nextMode);
    setError("");
  }

  function closeAuth() {
    if (loading) return;
    setMode(null);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mode) return;

    if (mode === "register" && !displayName.trim()) {
      setError("Please enter your display name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    if (mode === "register" && !preferredCurrency) {
      setError("Please choose your preferred currency.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = mode === "login"
        ? await login({ email, password })
        : await register({ displayName: displayName.trim(), email: email.trim(), password });

      setSession(data.accessToken, data.refreshToken, {
        displayName: data.displayName,
        email: data.email,
        avatarUrl: null,
        preferredCurrency: mode === "register" ? preferredCurrency : undefined,
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to continue. Please check your details."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="landing-page">
      <div className="landing-shell">
        <header className="landing-topbar">
          <div className="landing-brand">
            <BrandLogo size={62} withWordmark />
          </div>

          <div className="landing-actions">
            <button className={mode === "login" ? "secondary-button active-lite" : "secondary-button"} type="button" onClick={() => openAuth("login")}>
              Log In
            </button>
            <button className={mode === "register" ? "primary-button" : "secondary-button"} type="button" onClick={() => openAuth("register")}>
              Sign Up
            </button>
          </div>
        </header>

        <div className="landing-grid landing-grid-single">
          <section className="landing-story panel-soft landing-story-wide">
            <span className="eyebrow">Pre-login Home</span>
            <h1>Track income, expenses, budgets, and savings in one calm workspace.</h1>
            <p className="landing-lead">
              Personal Finance Tracker helps you record money quickly, understand your spending, stay within budget,
              plan recurring bills, and steadily reach savings goals across desktop and mobile.
            </p>

            <div className="landing-highlight-grid">
              {highlights.map((item) => (
                <article className={`landing-highlight ${item.tone}`} key={item.value}>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>

            <div className="landing-story-lower">
              <div className="landing-feature-card">
                <div>
                  <span className="eyebrow">Why it feels clear</span>
                  <strong>Designed for fast entry and gentle review</strong>
                </div>
                <p>
                  A quiet visual system, strong financial hierarchy, and responsive layouts make the product feel just as
                  comfortable on mobile as it does on desktop.
                </p>

                <div className="landing-feature-points">
                  {featurePoints.map((point) => (
                    <div className="landing-feature-point" key={point}>
                      <span className="landing-feature-dot" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="landing-feature-stats">
                  {featureStats.map((item) => (
                    <div className="landing-feature-stat" key={item.label}>
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>

                <div className="landing-feature-visual" aria-hidden="true">
                  <div className="landing-visual-grid" />
                  <div className="landing-visual-bars">
                    {featureBars.map((height, index) => (
                      <span className="landing-visual-bar" key={index} style={{ height: `${height}px` }} />
                    ))}
                  </div>
                  <div className="landing-visual-line">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>

              <div className="auth-placeholder auth-invite-card landing-invite-card">
                <span className="eyebrow">Open Your Space</span>
                <h2>One small step now. A clearer month ahead.</h2>
                <p>Choose your entry from the top-right corner and let the app take it from there.</p>

                <div className="auth-prompt-stack">
                  {promptSteps.map((step, index) => (
                    <div className="auth-prompt-row" key={step}>
                      <span className="auth-step-chip">0{index + 1}</span>
                      <p>{step}</p>
                    </div>
                  ))}
                </div>

                <div className="auth-mini-note">
                  <strong>Most people begin with one account and their first transaction.</strong>
                  <p>That single action is usually enough to make the dashboard feel alive immediately.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {mode ? (
          <div className="auth-modal-overlay" role="presentation" onClick={closeAuth}>
            <div className={`auth-modal auth-modal-${mode} panel`} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={(event) => event.stopPropagation()}>
              <button className="auth-modal-close" type="button" aria-label="Close" onClick={closeAuth}>
                <span />
                <span />
              </button>

              <span className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</span>
              <h2 id="auth-modal-title">{mode === "login" ? "Continue with your account" : "Start your personal finance workspace"}</h2>
              <p>{mode === "login" ? "Sign in to open your dashboard, transactions, budgets, and reports." : "Create an account to begin tracking your finances with a clean and focused setup."}</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === "register" ? (
                  <label>
                    <span className="auth-label">Display name <span className="required-mark">*</span></span>
                    <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required placeholder="Your name" />
                  </label>
                ) : null}

                <label>
                  <span className="auth-label">Email <span className="required-mark">*</span></span>
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@example.com" />
                </label>

                <label>
                  <span className="auth-label">Password <span className="required-mark">*</span></span>
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required placeholder="Enter your password" />
                </label>

                {mode === "register" ? (
                  <label>
                    <span className="auth-label">Preferred currency <span className="required-mark">*</span></span>
                    <select value={preferredCurrency} onChange={(event) => setPreferredCurrency(event.target.value as SupportedCurrency)} required>
                      {currencyOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <small className="auth-helper-text">You can change this anytime later in Settings.</small>
                  </label>
                ) : null}

                {error ? <div className="status-banner error">{error}</div> : null}

                <button className="primary-button" type="submit" disabled={loading}>
                  {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
                </button>
              </form>
            </div>
          </div>
        ) : null}

        <footer className="site-footer landing-footer">
          <div>
            <strong>Personal Finance Tracker</strong>
            <p>A clear and responsive finance workspace built to help you record money easily and stay confident about every month ahead.</p>
          </div>
          <span>Copyright (c) {currentYear} Personal Finance Tracker. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}
