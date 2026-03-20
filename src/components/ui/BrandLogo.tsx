import { useId } from "react";

type BrandLogoProps = {
  size?: number;
  withWordmark?: boolean;
  tagline?: string;
};

export function BrandLogo({ size = 62, withWordmark = true, tagline = "Elegant control for everyday money decisions" }: BrandLogoProps) {
  const gradientId = useId();
  const shellId = `${gradientId}-shell`;
  const strokeId = `${gradientId}-stroke`;
  const accentId = `${gradientId}-accent`;

  return (
    <div className="brand-lockup">
      <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true" className="brand-svg">
        <defs>
          <linearGradient id={shellId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#20324c" />
            <stop offset="100%" stopColor="#4c78a6" />
          </linearGradient>
          <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6f9fd" />
            <stop offset="100%" stopColor="#d6dfeb" />
          </linearGradient>
          <linearGradient id={accentId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#77d1af" />
            <stop offset="100%" stopColor="#2f7a5c" />
          </linearGradient>
        </defs>

        <rect x="5" y="5" width="62" height="62" rx="20" fill={`url(#${shellId})`} />
        <rect x="16" y="17" width="40" height="38" rx="13" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" />
        <path d="M20 48h32" stroke="rgba(255,255,255,0.16)" strokeWidth="2" strokeLinecap="round" />
        <rect x="23" y="34" width="7" height="14" rx="3.5" fill={`url(#${strokeId})`} />
        <rect x="33" y="28" width="7" height="20" rx="3.5" fill={`url(#${strokeId})`} />
        <rect x="43" y="22" width="7" height="26" rx="3.5" fill={`url(#${accentId})`} />
        <path d="M24 26.5c4.8-4.7 10.2-6.7 16.3-5.9 3.1.4 5.9 1.5 8.4 3.4" fill="none" stroke="rgba(255,255,255,0.70)" strokeWidth="2.1" strokeLinecap="round" />
        <circle cx="50.5" cy="23.8" r="2.4" fill="#f3f7fb" />
      </svg>
      {withWordmark ? (
        <div>
          <strong>Personal Finance Tracker</strong>
          <p>{tagline}</p>
        </div>
      ) : null}
    </div>
  );
}
