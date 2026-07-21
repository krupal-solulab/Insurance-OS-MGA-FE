/* ============================================================
   Bespoke line icons for the Coverline marketing page.
   Consistent 24px grid, 1.5 stroke, `currentColor` for the
   frame and a single accent stroke for emphasis. Deliberately
   drawn for the underwriting narrative rather than a generic
   icon set.
   ============================================================ */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const accent = "var(--color-accent)";

/** 01 — Read: a document with scan lines being ingested. */
export function IconRead({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M8.5 12h5" stroke={accent} />
      <path d="M8.5 15h7" />
      <path d="M8.5 18h4" />
    </svg>
  );
}

/** 02 — Check: rules matched against a checklist. */
export function IconCheck({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M7.5 9l1.6 1.6L12 7.8" stroke={accent} />
      <path d="M14.5 9.2h2.5" />
      <path d="M7.5 15l1.6 1.6L12 13.8" />
      <path d="M14.5 15.2h2.5" stroke={accent} />
    </svg>
  );
}

/** 03 — Draft: a recommendation written with a cited source. */
export function IconDraft({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 19V6a2 2 0 0 1 2-2h7l4 4v3" />
      <path d="M13 4v4h4" />
      <path d="M8 12h5" />
      <path d="M15.5 20.5l5-5-2-2-5 5-.6 2.6z" stroke={accent} />
    </svg>
  );
}

/** 04 — Approve: a human decision / signature stamp. */
export function IconApprove({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 15.5c2.2-3.4 4.1-5 5.6-5 1.6 0 1 2.4 2.2 2.4 1.4 0 2.4-4.4 4-4.4 1.2 0 1.6 2.1 4.2 2.1" stroke={accent} />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

/** Why 01 — MGA-native: a tuned dial / gauge. */
export function IconDial({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15l4-3.5" stroke={accent} />
      <circle cx="12" cy="15" r="1.4" fill={accent} stroke="none" />
      <path d="M4 15h1.6M18.4 15H20M12 6.5V8" />
    </svg>
  );
}

/** Why 02 — Full lifecycle: three linked nodes on one spine. */
export function IconLifecycle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 5v14" />
      <circle cx="6" cy="7" r="1.6" />
      <circle cx="6" cy="17" r="1.6" />
      <path d="M7.6 7h6a3 3 0 0 1 0 6H10" stroke={accent} />
      <path d="M12 10l-2 3 2 0-2 0" />
      <circle cx="18" cy="10" r="1.6" stroke={accent} />
    </svg>
  );
}

/** Why 03 — Runs on what you use: interlocking plug/stack. */
export function IconStack({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l8 4.5-8 4.5-8-4.5z" />
      <path d="M4 12l8 4.5 8-4.5" stroke={accent} />
      <path d="M4 16.5L12 21l8-4.5" />
    </svg>
  );
}
