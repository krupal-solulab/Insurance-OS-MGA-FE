import { useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  Download,
  Scan,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  FileSpreadsheet,
  ListChecks,
  ScrollText,
  RefreshCcw,
  ShieldCheck,
  Send,
  FileWarning,
  Database,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { bordereaux, nowClock, type Bordereau, type BordereauChecks, type CheckStatus, type ActivityEntry } from "./mocks";

/* ============================================================
   Bordereau Reporting — PRD-aligned clickable prototype.
   No backend: local state seeded from the mock model in
   mocks.ts. Four distinct checks (completeness / format /
   reconciliation / data-currency) gate submission; nothing is
   submitted without human approval.
   ============================================================ */

type CheckKey = keyof BordereauChecks;

const CHECK_META: Record<CheckKey, { label: string; icon: any; blurb: string }> = {
  completeness: { label: "Completeness", icon: ListChecks, blurb: "Every transaction in the universe is present" },
  format: { label: "Format compliance", icon: FileSpreadsheet, blurb: "Matches the carrier's template field-by-field" },
  reconciliation: { label: "Reconciliation", icon: ScrollText, blurb: "Totals match the carrier statement" },
  dataCurrency: { label: "Data currency", icon: RefreshCcw, blurb: "Claim status current as of compilation" },
};

function statusKind(s: CheckStatus): "pass" | "fail" | "na" {
  if (s === "NOT_APPLICABLE") return "na";
  if (["GAP_DETECTED", "NON_COMPLIANT", "DISCREPANCY", "STALE"].includes(s)) return "fail";
  return "pass";
}

// resolving a failing check → its passing counterpart
const RESOLVE_TO: Partial<Record<CheckStatus, CheckStatus>> = {
  GAP_DETECTED: "COMPLETE",
  NON_COMPLIANT: "COMPLIANT",
  DISCREPANCY: "MATCHED",
  STALE: "CURRENT",
};
const RESOLVE_VERB: Partial<Record<CheckKey, string>> = {
  completeness: "Add missing transaction",
  format: "Apply carrier crosswalk",
  reconciliation: "Resolve discrepancy",
  dataCurrency: "Refresh claim data",
};

function isBlocked(checks: BordereauChecks): boolean {
  return (Object.keys(checks) as CheckKey[]).some((k) => statusKind(checks[k].status) === "fail");
}

/* ---------------------------- primitives ---------------------------- */

function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "accent" | "success" | "warn" | "danger" }) {
  const map: Record<string, string> = {
    neutral: "bg-secondary text-foreground border-border",
    accent: "bg-accent/10 text-accent border-accent/25",
    success: "bg-success/10 text-success border-success/25",
    warn: "bg-warn/10 text-warn border-warn/25",
    danger: "bg-destructive/10 text-destructive border-destructive/25",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[tone]}`}>{children}</span>;
}
function Button({ children, variant = "secondary", className = "", ...p }: any) {
  const base = "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50";
  const styles: Record<string, string> = {
    primary: "bg-foreground text-background hover:opacity-90",
    secondary: "border border-border bg-background hover:bg-secondary",
    ghost: "hover:bg-secondary",
    danger: "border border-destructive/40 text-destructive hover:bg-destructive/10",
    accent: "bg-accent text-accent-foreground hover:opacity-90",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...p}>{children}</button>;
}
function FoundationBadge() {
  return (
    <Link to="/app/foundation/extraction-core" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-foreground/40">
      <Scan className="h-3 w-3 text-accent" /> Extraction Core
    </Link>
  );
}
function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-secondary/60 p-1 text-xs">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={`rounded-md px-3 py-1.5 transition ${value === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t}</button>
      ))}
    </div>
  );
}

/* ---------------------------- main ---------------------------- */

type BdxState = { checks: BordereauChecks; filed: boolean; amendments: { at: string; note: string }[]; activity: ActivityEntry[] };

export function BordereauReporting() {
  const [selected, setSelected] = useState(bordereaux[0].id);
  const [tab, setTab] = useState("Checks");
  const [state, setState] = useState<Record<string, BdxState>>(() =>
    Object.fromEntries(bordereaux.map((b) => [b.id, { checks: structuredClone(b.checks), filed: false, amendments: [...b.amendments], activity: [...b.activity] }])),
  );

  const b = bordereaux.find((x) => x.id === selected)!;
  const st = state[selected];
  const blocked = isBlocked(st.checks);
  const failing = (Object.keys(st.checks) as CheckKey[]).filter((k) => statusKind(st.checks[k].status) === "fail");

  function log(entry: Omit<ActivityEntry, "at">) {
    setState((prev) => ({ ...prev, [selected]: { ...prev[selected], activity: [...prev[selected].activity, { at: nowClock(), ...entry }] } }));
  }
  function resolve(k: CheckKey) {
    const cur = st.checks[k].status;
    const next = RESOLVE_TO[cur];
    if (!next) return;
    setState((prev) => ({ ...prev, [selected]: { ...prev[selected], checks: { ...prev[selected].checks, [k]: { status: next, issues: [] } } } }));
    log({ who: "Priya R. (Ops)", what: `Resolved ${CHECK_META[k].label.toLowerCase()} check`, ctx: RESOLVE_VERB[k] });
  }
  function reRun() {
    log({ who: "AI · Compilation", what: "Re-ran all checks" });
  }
  function submit() {
    setState((prev) => ({ ...prev, [selected]: { ...prev[selected], filed: true } }));
    log({ who: "Priya R. (Ops)", what: "Approved & submitted to carrier", ctx: b.carrierName });
  }
  function fileCorrection() {
    setState((prev) => ({ ...prev, [selected]: { ...prev[selected], amendments: [...prev[selected].amendments, { at: `${b.period}`, note: "Correction filed — 1 late endorsement added" }] } }));
    log({ who: "Priya R. (Ops)", what: "Logged a correction / amendment" });
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 09"
        title="Bordereau Reporting"
        description="Carrier-ready premium & claims bordereaux, compiled from source transactions. Completeness, format, reconciliation, and data-currency are checked separately — submission is blocked until all pass and a human approves."
        actions={<Button variant="secondary"><Calendar className="h-4 w-4" />Schedule</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        {/* Carrier bordereau list */}
        <Panel title="Bordereaux" subtitle="Per-carrier · this period">
          <ul className="divide-y divide-border">
            {bordereaux.map((row) => {
              const rs = state[row.id];
              const rblocked = isBlocked(rs.checks);
              const alert = row.daysToDue <= row.profile.compilationDays + 2;
              return (
                <button key={row.id} onClick={() => { setSelected(row.id); setTab("Checks"); }} className={cn("flex w-full flex-col gap-1.5 py-3 text-left transition", selected === row.id ? "bg-secondary/50" : "hover:bg-secondary/30")}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{row.carrierName}</span>
                    <Chip tone={row.type === "CLAIMS" ? "accent" : "neutral"}>{row.type}</Chip>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {alert && <Clock className="h-3 w-3 text-warn" />}Due {row.dueDate} · {row.daysToDue}d
                    </span>
                    <span>{row.period}</span>
                  </div>
                  <div>
                    {rs.filed ? <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Submitted</Chip> : rblocked ? <Chip tone="danger"><XCircle className="h-3 w-3" /> Blocked</Chip> : <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Ready</Chip>}
                  </div>
                </button>
              );
            })}
          </ul>
        </Panel>

        {/* Detail */}
        <div className="space-y-5">
          {/* Header + overall status + approve/submit */}
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-muted-foreground">{b.id}</div>
                <h2 className="mt-1 font-serif text-2xl leading-tight">{b.carrierName} · {b.type === "PREMIUM" ? "Premium" : "Claims"} bordereau</h2>
                <div className="mt-1 text-xs text-muted-foreground">{b.period} · {b.headline}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={reRun}><RefreshCcw className="h-4 w-4" />Re-run checks</Button>
                <Button variant="secondary" disabled={blocked || st.filed}><Download className="h-4 w-4" />Generate Excel</Button>
                {st.filed ? (
                  <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Submitted</Chip>
                ) : (
                  <Button variant="primary" onClick={submit} disabled={blocked} title={blocked ? "Resolve all failing checks first" : "Approve & submit to carrier"}>
                    Approve &amp; submit <Send className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Overall status banner */}
            <div className={cn("mt-4 flex items-start gap-3 rounded-xl border-2 p-4", st.filed ? "border-success/40 bg-success/5" : blocked ? "border-destructive/40 bg-destructive/5" : "border-success/40 bg-success/5")}>
              {st.filed ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : blocked ? <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-destructive" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />}
              <div>
                <div className={cn("font-serif text-lg", st.filed ? "text-success" : blocked ? "text-destructive" : "text-success")}>
                  {st.filed ? "Submitted to carrier" : blocked ? `Blocked — ${failing.length} check${failing.length > 1 ? "s" : ""} failing` : "Ready to submit"}
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">
                  {st.filed
                    ? "Compilation, checks, and submission are logged for audit."
                    : blocked
                      ? `Resolve: ${failing.map((k) => CHECK_META[k].label).join(", ")}. Nothing can be generated or submitted with an open issue.`
                      : "All applicable checks pass. Approve to submit — bordereaux are never auto-submitted."}
                </div>
              </div>
            </div>
          </Panel>

          {/* Four distinct checks — the core of the workflow */}
          <div className="grid gap-3 sm:grid-cols-2">
            {(Object.keys(st.checks) as CheckKey[]).map((k) => {
              const c = st.checks[k];
              const kind = statusKind(c.status);
              const Icon = CHECK_META[k].icon;
              const border = kind === "fail" ? "border-destructive/40" : kind === "na" ? "border-border" : "border-success/40";
              const StatusIcon = kind === "fail" ? XCircle : kind === "na" ? Info : CheckCircle2;
              const stone = kind === "fail" ? "text-destructive" : kind === "na" ? "text-muted-foreground" : "text-success";
              return (
                <div key={k} className={cn("rounded-xl border bg-background p-4", border)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4 text-accent" />{CHECK_META[k].label}</div>
                    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", stone)}><StatusIcon className="h-3.5 w-3.5" />{c.status.replace(/_/g, " ").toLowerCase()}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{CHECK_META[k].blurb}</div>
                  {c.issues.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {c.issues.map((iss, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-destructive"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />{iss}</li>
                      ))}
                    </ul>
                  )}
                  {kind === "fail" && !st.filed && (
                    <div className="mt-3"><Button variant="secondary" className="!py-1 !text-xs" onClick={() => resolve(k)}>{RESOLVE_VERB[k]}</Button></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <Panel>
            <Tabs tabs={["Bordereau rows", "Requirement profile", "Timeliness & history", "Activity"]} value={tab} onChange={setTab} />
            <div className="mt-5">
              {tab === "Bordereau rows" && <RowsTab b={b} />}
              {tab === "Requirement profile" && <ProfileTab b={b} />}
              {tab === "Timeliness & history" && <TimelinessTab b={b} amendments={st.amendments} onFileCorrection={fileCorrection} filed={st.filed} />}
              {tab === "Activity" && <ActivityTab activity={st.activity} />}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- tabs ---------------------------- */

function RowsTab({ b }: { b: Bordereau }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-medium">{b.rows.length} rows shown · every figure grounded to a source record</div>
        <FoundationBadge />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              {b.profile.columns.map((col, i) => <th key={col} className={cn("py-2 pr-3", i >= 3 ? "text-right" : "text-left")}>{col}</th>)}
              <th className="py-2 pr-3 text-left">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {b.rows.map((row, ri) => (
              <tr key={ri} className={cn("hover:bg-secondary/40", row.flagged && "bg-warn/5")}>
                {row.cells.map((cell, ci) => <td key={ci} className={cn("py-2 pr-3 font-mono", ci >= 3 && "text-right")}>{cell}</td>)}
                <td className="py-2 pr-3"><span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground"><Database className="h-3 w-3" />{row.source}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">No estimated or plugged values — each amount traces to a bound policy or claim record (BR-08).</div>
    </div>
  );
}

function ProfileTab({ b }: { b: Bordereau }) {
  const p = b.profile;
  const rows: [string, ReactNode][] = [
    ["Class code system", p.classCodeSystem],
    ["Date format", p.dateFormat],
    ["Frequency", p.frequency],
    ["Due-date rule", p.dueRule],
    ["Carrier statement for reconciliation", p.statementAvailable ? <Chip tone="success">Available</Chip> : <Chip tone="neutral">Not provided → reconciliation N/A</Chip>],
    ["Typical compilation time", `${p.compilationDays} days`],
    ["Required columns (in order)", <span className="font-mono text-[11px]">{p.columns.join(" · ")}</span>],
  ];
  return (
    <div>
      <div className="mb-3 text-xs font-medium">Bordereau Requirement Profile — discovery-sourced, per carrier (not standardized)</div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {rows.map(([label, val]) => (
          <li key={label} className="flex items-center justify-between gap-4 p-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right text-foreground">{val}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelinessTab({ b, amendments, onFileCorrection, filed }: { b: Bordereau; amendments: { at: string; note: string }[]; onFileCorrection: () => void; filed: boolean }) {
  const alert = b.daysToDue <= b.profile.compilationDays + 2;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-xs font-medium">Timeliness</div>
          <div className={cn("rounded-xl border p-4", alert ? "border-warn/40 bg-warn/5" : "border-border")}>
            <div className="flex items-center gap-2"><Clock className={cn("h-5 w-5", alert ? "text-warn" : "text-muted-foreground")} /><div className="font-serif text-xl">{b.daysToDue} days to due date</div></div>
            <div className="mt-2 text-sm text-ink-soft">
              Due {b.dueDate}. Compilation typically takes {b.profile.compilationDays} days for {b.carrierName}.
              {alert ? " Alert: start now to file on time (BR-05, carrier-calibrated)." : " Comfortable lead time."}
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-medium">Amendments / corrections</div>
          {amendments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-3 text-[12px] text-muted-foreground">No corrections filed for this period.</div>
          ) : (
            <ul className="space-y-1.5 text-sm">{amendments.map((a, i) => <li key={i} className="rounded-lg border border-border p-2 text-[12px]"><b>{a.at}</b> — {a.note}</li>)}</ul>
          )}
          {filed && <div className="mt-2"><Button variant="secondary" className="!py-1 !text-xs" onClick={onFileCorrection}>Log a correction</Button></div>}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-medium">Filing history</div>
        <ul className="space-y-2 text-sm">
          {b.filedHistory.map((h) => <li key={h.period} className="flex justify-between"><span>{h.period}</span><Chip tone="success">{h.status}</Chip></li>)}
        </ul>
      </div>
    </div>
  );
}

function ActivityTab({ activity }: { activity: ActivityEntry[] }) {
  return (
    <ul className="divide-y divide-border">
      {[...activity].reverse().map((a, i) => (
        <li key={i} className="flex items-start gap-3 py-2.5 text-sm">
          <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.at}</span>
          <div className="flex-1"><div><b>{a.who}</b> — {a.what}</div>{a.ctx && <div className="text-[11px] text-muted-foreground">{a.ctx}</div>}</div>
        </li>
      ))}
    </ul>
  );
}
