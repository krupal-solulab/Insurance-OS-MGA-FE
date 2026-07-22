import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Gavel,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Mail,
  RotateCcw,
  X,
  Copy,
  Database,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole, JUNIOR_PREMIUM_CAP, parseMoney } from "./role";
import { useDecisions } from "./decisions";
import {
  renewals,
  getRenewalDetail,
  RENEWAL_REC_LABEL,
  nowClock,
  type Renewal,
  type RenewalDetail,
  type RenewalRecommendation,
  type ChangeCategory,
  type Direction,
  type ActivityEntry,
  type CompareRow,
} from "./mocks";

/* ============================================================
   Renewal Management — PRD-aligned clickable prototype.
   No backend: local state seeded from the mock detail model
   in mocks.ts. Appetite rules are the SAME shared set as
   Submission Triage; Renewal re-runs them against the current
   version and flags drift. Everything is wired + logs to
   Activity in-session.
   ============================================================ */

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

function FoundationBadge({ kind }: { kind: "extraction" | "decision" }) {
  const isExt = kind === "extraction";
  return (
    <Link
      to={isExt ? "/app/foundation/extraction-core" : "/app/foundation/decision-core"}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-foreground/40"
    >
      {isExt ? <Scan className="h-3 w-3 text-accent" /> : <Gavel className="h-3 w-3 text-accent" />}
      {isExt ? "Extraction Core" : "Decision Core"}
    </Link>
  );
}

function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-secondary/60 p-1 text-xs">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={`rounded-md px-3 py-1.5 transition ${value === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function recTone(rec: RenewalRecommendation) {
  return rec === "RENEW_AS_IS" ? "success" : rec === "NON_RENEW" ? "danger" : "warn";
}
function RecPill({ rec }: { rec: RenewalRecommendation }) {
  const Icon = rec === "RENEW_AS_IS" ? CheckCircle2 : rec === "NON_RENEW" ? XCircle : Info;
  return <Chip tone={recTone(rec)}><Icon className="h-3 w-3" /> {RENEWAL_REC_LABEL[rec]}</Chip>;
}

const CATEGORY_META: Record<ChangeCategory, { label: string; icon: any }> = {
  exposure: { label: "Exposure", icon: TrendingUp },
  loss: { label: "Loss", icon: AlertTriangle },
  appetite: { label: "Appetite", icon: ShieldAlert },
  timing: { label: "Timing", icon: Clock },
  info: { label: "Info", icon: Info },
};
function dirTone(d: Direction) {
  return d === "favorable" ? "success" : d === "unfavorable" ? "danger" : "neutral";
}

/* ---------------------------- main ---------------------------- */

type Decision = { action: "approved" | "changes" | "info" | "nonrenew" | "escalated" | null; label?: string };

export function RenewalManagement() {
  const [selected, setSelected] = useState(renewals[0].id);
  const [tab, setTab] = useState("Comparison");
  const [details, setDetails] = useState<Record<string, RenewalDetail>>(() =>
    Object.fromEntries(renewals.map((r) => [r.id, structuredClone(getRenewalDetail(r))])),
  );
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [override, setOverride] = useState<RenewalRecommendation | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [draft, setDraft] = useState<null | "terms" | "nonrenew">(null);

  const { role } = useRole();
  const isJunior = role === "junior";
  const { record } = useDecisions();

  const r = renewals.find((x) => x.id === selected)!;
  const d = details[selected];
  const decision = decisions[selected] ?? { action: null };
  const overCap = parseMoney(r.indicated) > JUNIOR_PREMIUM_CAP;
  const canDecide = !isJunior || (!overCap && d.hardRulePassed && d.recommendation !== "NON_RENEW");

  const attention = useMemo(() => Object.values(details).filter((x) => x.timing.lapseRisk || !x.hardRulePassed).length, [details]);

  function logActivity(entry: Omit<ActivityEntry, "at">) {
    setDetails((prev) => ({ ...prev, [selected]: { ...prev[selected], activity: [...prev[selected].activity, { at: nowClock(), ...entry }] } }));
  }
  function reprocess() {
    setDetails((prev) => ({ ...prev, [selected]: { ...prev[selected], processing: "ready" } }));
    logActivity({ who: "Priya R. (UW)", what: "Re-ran renewal review" });
  }
  function approve() {
    const label = RENEWAL_REC_LABEL[d.recommendation];
    setDecisions((prev) => ({ ...prev, [selected]: { action: d.recommendation === "NON_RENEW" ? "nonrenew" : "approved", label } }));
    logActivity({ who: "Priya R. (UW)", what: `Approved — ${label}`, ctx: "AI + underwriter co-sign" });
    record({ actor: "human", who: "Priya R. (UW)", what: `${label}`, ctx: r.insured, workflow: "Renewal" });
    if (d.recommendation === "NON_RENEW") setDraft("nonrenew");
  }
  function requestInfo() {
    setDecisions((prev) => ({ ...prev, [selected]: { action: "info", label: "Requested information" } }));
    setDraft("terms");
  }
  function escalate() {
    setDecisions((prev) => ({ ...prev, [selected]: { action: "escalated", label: "Escalated to senior" } }));
    const ctx = overCap ? "above authority limit" : !d.hardRulePassed ? "appetite drift / non-renew" : "escalated decision";
    logActivity({ who: "Sofia A. (Jr UW)", what: "Escalated to senior underwriter", ctx });
    record({ actor: "human", who: "Sofia A. (Jr UW)", what: "Escalated to senior", ctx: `${r.insured} · ${ctx}`, workflow: "Renewal" });
  }
  function confirmOverride() {
    if (!override) return;
    setDecisions((prev) => ({ ...prev, [selected]: { action: "changes", label: `Override → ${RENEWAL_REC_LABEL[override]}` } }));
    logActivity({ who: "Priya R. (UW)", what: `Override → ${RENEWAL_REC_LABEL[override]}`, ctx: overrideReason || "no reason given" });
    record({ actor: "human", who: "Priya R. (UW)", what: `Override → ${RENEWAL_REC_LABEL[override]}`, ctx: `${r.insured} · ${overrideReason || "no reason"}`, workflow: "Renewal" });
    setOverride(null);
    setOverrideReason("");
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 02"
        title="Renewal Management"
        description="Prior term vs. renewal, re-checked against current appetite. Material changes flagged, recommendation drafted, human-approved."
        actions={<Button variant="primary"><Sparkles className="h-4 w-4" />Run renewal review</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)]">
        {/* Pipeline */}
        <Panel title="Renewal pipeline" subtitle={`Next 60 days · ${renewals.length} in worklist${attention ? ` · ${attention} need attention` : ""}`}>
          <ul className="divide-y divide-border">
            {renewals.map((row) => {
              const det = details[row.id];
              const dec = decisions[row.id];
              return (
                <button
                  key={row.id}
                  onClick={() => { setSelected(row.id); setTab("Comparison"); }}
                  className={cn("flex w-full flex-col gap-1.5 py-3 text-left transition", selected === row.id ? "bg-secondary/50" : "hover:bg-secondary/30")}
                >
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{row.insured}</span>
                    <span className="shrink-0 font-mono text-xs text-accent">{row.change}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {det.timing.lapseRisk && <Clock className="h-3 w-3 text-warn" />}
                      Exp {row.expiring} · {det.timing.daysToExpiration}d
                    </span>
                    <span>LR {row.lossRatio}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <RecPill rec={det.recommendation} />
                    {det.changeFlags.slice(0, 2).map((f, i) => (
                      <Chip key={i} tone={dirTone(f.direction)}>{CATEGORY_META[f.category].label}</Chip>
                    ))}
                    {dec?.action && <Chip tone="neutral">✓ {dec.label}</Chip>}
                  </div>
                </button>
              );
            })}
          </ul>
        </Panel>

        {/* Detail */}
        <div className="space-y-5">
          {d.processing !== "ready" && (
            <div className="flex items-center gap-3 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm">
              <RotateCcw className="h-5 w-5 animate-spin text-accent" />
              <div className="flex-1"><div className="font-medium">Renewal review in progress</div><div className="text-[11px] text-muted-foreground">Recommendation appears once processing completes.</div></div>
              <Button variant="secondary" onClick={reprocess}><RotateCcw className="h-4 w-4" />Reprocess</Button>
            </div>
          )}

          {/* Header */}
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
                <h2 className="mt-1 font-serif text-2xl leading-tight">{r.insured}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />Expires {r.expiring} · {d.timing.daysToExpiration}d</span>
                  <span>5yr loss ratio {r.lossRatio}</span>
                  <span className="inline-flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    Prior term: {d.priorSource === "PAS" ? "PAS record" : d.priorSource === "stored_triage_record" ? "stored triage record" : "manual queue"}
                  </span>
                </div>
              </div>
              {decision.action ? (
                <Chip tone={decision.action === "nonrenew" ? "danger" : decision.action === "escalated" ? "accent" : decision.action === "changes" ? "warn" : "success"}>
                  <CheckCircle2 className="h-3 w-3" /> {decision.label}
                </Chip>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={requestInfo}>Request information</Button>
                  {!canDecide ? (
                    <Button variant="primary" onClick={escalate}>Escalate to senior <ArrowRight className="h-4 w-4" /></Button>
                  ) : d.recommendation === "NON_RENEW" ? (
                    <Button variant="danger" onClick={approve}>Non-renew</Button>
                  ) : (
                    <Button variant="primary" onClick={approve}>Approve renewal <ArrowRight className="h-4 w-4" /></Button>
                  )}
                </div>
              )}
            </div>

            {isJunior && !decision.action && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                Your authority: renew up to ${JUNIOR_PREMIUM_CAP.toLocaleString()}.
                {overCap ? " Above your limit — route to a senior." : !d.hardRulePassed ? " Appetite-drift / non-renewals are a senior decision." : ""}
              </div>
            )}

            {/* Appetite-drift / hard-fail banner (RN-10) */}
            {!d.hardRulePassed && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <div className="font-serif text-lg text-destructive">Does not meet current appetite</div>
                  {d.appetiteDrift && <div className="mt-1 text-[13px] text-foreground">{d.appetiteDrift}</div>}
                  <div className="mt-1 text-[11px] text-muted-foreground">Bound under {d.rulesVersionAtBinding} · current {d.rulesVersion}. Non-renewal notice requires compliance review.</div>
                </div>
              </div>
            )}

            {/* Metrics */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MetricTile label="Recommendation" value={RENEWAL_REC_LABEL[d.recommendation]} sub={`${Math.round(d.confidence * 100)}% confidence`} tone={recTone(d.recommendation)} />
              <MetricTile label="Indicated change" value={r.change} sub={`${r.priorPremium} → ${r.indicated}`} tone="warn" />
              <MetricTile
                label="Appetite recheck"
                value={d.hardRulePassed ? "In appetite" : "Drifted out"}
                sub={`${d.appetite.filter((x) => x.pass).length} of ${d.appetite.length} rules pass`}
                tone={d.hardRulePassed ? "success" : "danger"}
              />
            </div>

            {/* Rules version + prior source line */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Gavel className="h-3 w-3 text-accent" />
                Re-checked against <Link to="/app/workflows/rules-console" className="text-foreground underline-offset-2 hover:text-accent hover:underline">Rules Console</Link> · current {d.rulesVersion}
              </span>
              <span>·</span>
              <span>bound under {d.rulesVersionAtBinding}</span>
            </div>
          </Panel>

          {/* Change-flag summary (categorized, distinct) */}
          {d.changeFlags.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {d.changeFlags.map((f, i) => {
                const Icon = CATEGORY_META[f.category].icon;
                const tone = dirTone(f.direction);
                const border = tone === "success" ? "border-success/30" : tone === "danger" ? "border-destructive/30" : "border-warn/30";
                const text = tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "text-warn";
                return (
                  <div key={i} className={cn("flex items-start gap-3 rounded-xl border bg-background p-3", border)}>
                    <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", text)} />
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {f.label}
                        <Chip tone={tone}>{CATEGORY_META[f.category].label}</Chip>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{f.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tabs */}
          <Panel>
            <Tabs tabs={["Comparison", "Appetite recheck", "Loss & timing", "Recommendation", "Activity"]} value={tab} onChange={setTab} />
            <div className="mt-5">
              {tab === "Comparison" && <ComparisonTab d={d} />}
              {tab === "Appetite recheck" && <AppetiteTab d={d} />}
              {tab === "Loss & timing" && <LossTimingTab d={d} />}
              {tab === "Recommendation" && (
                <RecommendationTab d={d} decision={decision} isJunior={isJunior} canDecide={canDecide} onApprove={approve} onOverride={(x) => setOverride(x)} onEscalate={escalate} onDraftTerms={() => setDraft("terms")} onDraftNonRenew={() => setDraft("nonrenew")} />
              )}
              {tab === "Activity" && <ActivityTab d={d} />}
            </div>
          </Panel>

          {/* Broker context */}
          {d.broker.agency !== "—" && (
            <Panel title="Broker context">
              <div className="text-sm">
                <div className="font-medium">{d.broker.name} · {d.broker.agency}</div>
                <div className="text-[11px] text-muted-foreground">{d.broker.tenure}</div>
              </div>
              {d.broker.note && <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-ink-soft">“{d.broker.note}”</div>}
              <div className="mt-3 flex gap-2">
                <a href="/app/workflows/broker-copilot"><Button variant="secondary"><MessageSquare className="h-4 w-4" />Reply in Copilot</Button></a>
                <Button variant="secondary">View full history</Button>
              </div>
            </Panel>
          )}
        </div>
      </div>

      {override && <OverrideModal rec={override} reason={overrideReason} setReason={setOverrideReason} onCancel={() => { setOverride(null); setOverrideReason(""); }} onConfirm={confirmOverride} />}
      {draft && (
        <DraftModal
          kind={draft}
          r={r}
          d={d}
          onClose={() => setDraft(null)}
          onSent={() => { logActivity({ who: "Priya R. (UW)", what: draft === "nonrenew" ? "Sent non-renewal notice (compliance-reviewed)" : "Sent renewal terms to broker", ctx: d.broker.agency }); setDraft(null); }}
        />
      )}
    </div>
  );
}

/* ---------------------------- shared ---------------------------- */

function MetricTile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "success" | "warn" | "danger" | "neutral" }) {
  const border = tone === "success" ? "border-success/30" : tone === "danger" ? "border-destructive/30" : tone === "warn" ? "border-warn/30" : "border-border";
  return (
    <div className={`rounded-xl border ${border} bg-secondary/30 p-4`}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-2xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

/* ---------------------------- Comparison tab ---------------------------- */

function ComparisonTab({ d }: { d: RenewalDetail }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-medium">Prior term vs. renewal — favorable / unfavorable framed</div>
        <FoundationBadge kind="extraction" />
      </div>
      <div className="grid grid-cols-[1.2fr_1fr_1.4fr] overflow-hidden rounded-lg border border-border text-sm">
        <HeadCell>Attribute</HeadCell>
        <HeadCell>Prior term</HeadCell>
        <HeadCell>Renewal</HeadCell>
        {d.comparison.map((row) => <CompareRowView key={row.label} row={row} />)}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-success" /> favorable</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> unfavorable</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-border" /> neutral</span>
      </div>
    </div>
  );
}
function HeadCell({ children }: { children: ReactNode }) {
  return <div className="bg-secondary/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{children}</div>;
}
function CompareRowView({ row }: { row: CompareRow }) {
  const tone = row.direction === "favorable" ? "text-success" : row.direction === "unfavorable" ? "text-destructive" : "text-muted-foreground";
  return (
    <>
      <div className="border-t border-border px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">{row.label}</div>
      <div className={`border-t border-border px-4 py-2.5 ${row.strong ? "font-serif" : ""}`}>{row.prior}</div>
      <div className={`border-t border-border px-4 py-2.5 ${row.strong ? "font-serif" : ""}`}>
        <span className="mr-2">{row.current}</span>
        {row.change && <span className={`font-mono text-[11px] ${tone}`}>{row.change}</span>}
      </div>
    </>
  );
}

/* ---------------------------- Appetite tab ---------------------------- */

function AppetiteTab({ d }: { d: RenewalDetail }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-medium">Appetite re-check · {d.appetite.filter((x) => x.pass).length} of {d.appetite.length} rules pass</div>
        <FoundationBadge kind="decision" />
      </div>
      <div className="mb-3 rounded-lg border border-border bg-secondary/40 p-3 text-[12px] text-ink-soft">
        Uses the <b>same appetite rules as Submission Triage</b> — re-run against the <b>current</b> version ({d.rulesVersion}), not the version at binding ({d.rulesVersionAtBinding}). A rule change can push an account out of appetite even if nothing about it changed.
      </div>
      {d.appetiteDrift && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> <div><b>Appetite drift.</b> {d.appetiteDrift}</div>
        </div>
      )}
      <ul className="divide-y divide-border rounded-lg border border-border">
        {d.appetite.map((rule) => (
          <li key={rule.rule} className="flex items-start gap-3 p-3 text-sm">
            {rule.pass ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", rule.hard ? "text-destructive" : "text-warn")} />}
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">{rule.rule}{rule.hard && <Chip tone="neutral">hard rule</Chip>}</div>
              <div className="text-[11px] text-muted-foreground">{rule.detail}</div>
            </div>
            <Chip tone={rule.pass ? "success" : rule.hard ? "danger" : "warn"}>{rule.pass ? "Pass" : rule.hard ? "Fail" : "Review"}</Chip>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------- Loss & timing tab ---------------------------- */

function LossTimingTab({ d }: { d: RenewalDetail }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between"><div className="text-xs font-medium">Loss-history changes (this term)</div><FoundationBadge kind="decision" /></div>
        <ul className="space-y-2">
          {d.lossChanges.map((c, i) => {
            const Icon = c.direction === "favorable" ? TrendingUp : c.direction === "unfavorable" ? TrendingDown : Minus;
            const tone = c.direction === "favorable" ? "text-success" : c.direction === "unfavorable" ? "text-destructive" : "text-muted-foreground";
            return (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone)} />
                <div>
                  <div className="font-medium capitalize">{c.type.replace("_", " ")}</div>
                  <div className="text-[11px] text-muted-foreground">{c.description}{c.source ? ` · ${c.source}` : ""}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div>
        <div className="mb-2 text-xs font-medium">Timing / lapse risk</div>
        <div className={cn("rounded-xl border p-4", d.timing.lapseRisk ? "border-warn/40 bg-warn/5" : "border-border")}>
          <div className="flex items-center gap-2">
            <Clock className={cn("h-5 w-5", d.timing.lapseRisk ? "text-warn" : "text-muted-foreground")} />
            <div className="font-serif text-xl">{d.timing.daysToExpiration} days to expiration</div>
          </div>
          <div className="mt-2 text-sm text-ink-soft">
            {d.timing.lapseRisk
              ? "Lapse risk — submission arrived close to expiration. Expedite to avoid a coverage gap (RN-11)."
              : d.timing.noSubmission
                ? "No renewal submission received yet — proactive broker outreach recommended (RN-12)."
                : "Comfortable lead time — no timing concern."}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">Timing flags are procedural (speed), kept distinct from risk-quality flags.</div>
      </div>
    </div>
  );
}

/* ---------------------------- Recommendation tab ---------------------------- */

function RecommendationTab({
  d, decision, isJunior, canDecide, onApprove, onOverride, onEscalate, onDraftTerms, onDraftNonRenew,
}: {
  d: RenewalDetail; decision: Decision; isJunior: boolean; canDecide: boolean; onApprove: () => void; onOverride: (r: RenewalRecommendation) => void; onEscalate: () => void; onDraftTerms: () => void; onDraftNonRenew: () => void;
}) {
  const tone = recTone(d.recommendation);
  const border = tone === "success" ? "border-success/40 bg-success/5" : tone === "danger" ? "border-destructive/40 bg-destructive/5" : "border-warn/40 bg-warn/5";
  const Icon = d.recommendation === "RENEW_AS_IS" ? CheckCircle2 : d.recommendation === "NON_RENEW" ? XCircle : Info;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className={`rounded-xl border-2 ${border} p-4 md:col-span-2`}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "text-warn")} />
          <div className="font-serif text-xl">{RENEWAL_REC_LABEL[d.recommendation]}</div>
          <Chip tone={tone}>{Math.round(d.confidence * 100)}% confidence</Chip>
        </div>
        <p className="mt-3 text-sm text-foreground">{d.narrative}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.citations.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"><FileText className="h-3 w-3" /> {c}</span>
          ))}
        </div>

        {d.changes.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium">What's changing ({d.changes.length})</div>
              <Button variant="secondary" className="!py-1 !text-xs" onClick={onDraftTerms}><Mail className="h-3.5 w-3.5" />Draft renewal terms</Button>
            </div>
            <ul className="space-y-2">
              {d.changes.map((c) => (
                <li key={c.item} className="flex items-start gap-2 text-[13px]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <div className="font-medium">{c.item}</div>
                    <div className="text-[11px] text-muted-foreground">{c.reason}{c.source ? ` · ${c.source}` : ""}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {d.recommendation === "NON_RENEW" && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="text-[12px] text-destructive">Non-renewal notice must be compliance-reviewed before sending (state notice-period rules).</div>
            <Button variant="danger" className="!py-1 !text-xs" onClick={onDraftNonRenew}><Mail className="h-3.5 w-3.5" />Draft notice</Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Underwriter decision</div>
        {decision.action ? (
          <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-success"><CheckCircle2 className="h-4 w-4" />{decision.label}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Logged to the audit trail.</div>
          </div>
        ) : isJunior ? (
          <div className="mt-3 space-y-2 text-sm">
            {canDecide ? (
              <Button variant="primary" className="w-full" onClick={onApprove}>Approve — {RENEWAL_REC_LABEL[d.recommendation]}</Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={onEscalate}>Escalate to senior</Button>
            )}
            <div className="rounded-lg border border-border bg-secondary/40 p-2.5 text-[11px] text-muted-foreground">
              Overrides, non-renewals, and appetite-drift cases are senior-underwriter decisions.
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            <Button variant="primary" className="w-full" onClick={onApprove}>Approve — {RENEWAL_REC_LABEL[d.recommendation]}</Button>
            <Button variant="secondary" className="w-full" onClick={() => onOverride("RENEW_AS_IS")}>Override → Renew as-is</Button>
            <Button variant="secondary" className="w-full" onClick={() => onOverride("RENEW_WITH_CHANGES")}>Override → Renew with changes</Button>
            <Button variant="danger" className="w-full" onClick={() => onOverride("NON_RENEW")}>Override → Non-renew</Button>
          </div>
        )}
        <div className="mt-4 text-[11px] text-muted-foreground">Every decision, including overrides, is logged with a reason. Nothing is sent to a broker automatically.</div>
      </div>
    </div>
  );
}

/* ---------------------------- Activity tab ---------------------------- */

function ActivityTab({ d }: { d: RenewalDetail }) {
  return (
    <ul className="divide-y divide-border">
      {[...d.activity].reverse().map((a, i) => (
        <li key={i} className="flex items-start gap-3 py-3 text-sm">
          <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.at}</span>
          <div className="flex-1"><div><b>{a.who}</b> — {a.what}</div>{a.ctx && <div className="text-[11px] text-muted-foreground">{a.ctx}</div>}</div>
          {a.conf && a.conf !== "—" && <Chip tone="neutral">{a.conf}</Chip>}
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------- Override modal ---------------------------- */

const OVERRIDE_REASONS = ["Rate adequacy", "Loss trend", "Appetite exception", "Broker relationship", "Retention priority", "Other"];
function OverrideModal({ rec, reason, setReason, onCancel, onConfirm }: { rec: RenewalRecommendation; reason: string; setReason: (v: string) => void; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="font-serif text-lg">Override → {RENEWAL_REC_LABEL[rec]}</div>
          <button onClick={onCancel} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">Pick a reason code — logged to the audit / feedback loop.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {OVERRIDE_REASONS.map((x) => (
            <button key={x} onClick={() => setReason(x)} className={cn("rounded-lg border px-3 py-1.5 text-sm transition", reason === x ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary")}>{x}</button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm} disabled={!reason}>Confirm override</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Draft modal (terms / non-renewal) ---------------------------- */

function DraftModal({ kind, r, d, onClose, onSent }: { kind: "terms" | "nonrenew"; r: Renewal; d: RenewalDetail; onClose: () => void; onSent: () => void }) {
  const [complianceOk, setComplianceOk] = useState(false);
  const nonRenew = kind === "nonrenew";
  const first = d.broker.name.split(" ")[0] || "there";
  const body = nonRenew
    ? `Hi ${first},

I wanted to give you as much notice as possible on the ${r.insured} renewal. After our review, we won't be able to offer renewal terms this year.

Please know this isn't a reflection of ${r.insured} — our underwriting appetite for this class has changed since the policy was originally bound. We'd be glad to help with the transition and to look at other risks you're placing.

Happy to talk this through by phone if that's easier.

Best,
Priya`
    : `Hi ${first},

Thanks for the renewal on ${r.insured}. We're pleased to offer renewal terms at an indicated ${r.change} (${r.priorPremium} → ${r.indicated}). A few items to coordinate:

${(d.changes.length ? d.changes : [{ item: "No changes — renewing as-is", reason: "" }]).map((c, i) => `${i + 1}. ${c.item}${c.reason ? ` — ${c.reason}` : ""}`).join("\n")}

Let me know if you'd like to review anything together.

Best,
Priya`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /><div className="font-serif text-lg">{nonRenew ? "Draft non-renewal notice" : "Draft renewal terms"}</div></div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>

        {nonRenew && (
          <div className="border-b border-border bg-warn/5 px-5 py-3">
            <label className="flex items-start gap-2.5 text-[12px] text-foreground">
              <button type="button" onClick={() => setComplianceOk((v) => !v)} className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-none border", complianceOk ? "border-foreground bg-foreground text-background" : "border-warn/60 bg-background")}>
                {complianceOk && <CheckCircle2 className="h-3 w-3" />}
              </button>
              <span><b>Compliance review required.</b> Non-renewal notices carry state notice-period and content rules. Confirm the template was compliance-reviewed before sending. Loss figures are intentionally excluded from the notice.</span>
            </label>
          </div>
        )}

        <div className="space-y-3 p-5 text-sm">
          <div className="text-[11px] text-muted-foreground">To: {d.broker.name} · {d.broker.agency} — grounded in this renewal. Nothing sends automatically.</div>
          <textarea defaultValue={body} rows={12} className="w-full resize-none rounded-lg border border-border bg-paper p-3 font-mono text-[12px] leading-relaxed outline-none focus:border-foreground/40" />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
          <a href="/app/workflows/broker-copilot" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">Open in Broker Copilot <ArrowUpRight className="h-3 w-3" /></a>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(body)}><Copy className="h-4 w-4" />Copy</Button>
            <Button variant="primary" onClick={onSent} disabled={nonRenew && !complianceOk}>Mark as sent</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
