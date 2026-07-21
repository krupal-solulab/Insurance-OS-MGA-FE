import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  Download,
  Sparkles,
  Gavel,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Mail,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole, JUNIOR_PREMIUM_CAP } from "./role";
import { submissions, ratePlan, rate, getQuoteBase, nowClock, type Submission, type QuoteResult, type ActivityEntry } from "./mocks";

/* ============================================================
   Quoting & Rating Support — PRD-aligned clickable prototype.
   No backend: the rating engine is the pure `rate()` function
   over the rate-plan data in mocks.ts. Inputs recompute the
   premium, band, ratios, and a cited factor breakdown live.
   Human approves the quote; nothing binds here.
   ============================================================ */

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
    <Link to="/app/foundation/decision-core" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-foreground/40">
      <Gavel className="h-3 w-3 text-accent" /> Decision Core
    </Link>
  );
}
function FieldGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${money(Math.abs(n))}`;

const PRESETS = [
  { name: "Preferred", deductibleK: 25, limitM: 5 },
  { name: "Deductible buy-down", deductibleK: 10, limitM: 5 },
  { name: "High-limit", deductibleK: 25, limitM: 10 },
];

export function QuotingRating() {
  // Quotable submissions (those in/marginal appetite that reached scoring)
  const quotable = submissions.filter((s) => s.status !== "Declined");
  const [selectedId, setSelectedId] = useState(quotable[0].id);
  const s = submissions.find((x) => x.id === selectedId) as Submission;
  const base = useMemo(() => getQuoteBase(s), [s]);

  const [ded, setDed] = useState(25);
  const [limit, setLimit] = useState(5);
  const [ends, setEnds] = useState<string[]>(ratePlan.endorsements.filter((e) => e.defaultOn).map((e) => e.key));
  const [decision, setDecision] = useState<{ action: string; label: string } | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([
    { at: "09:20", who: "AI · Decision Core", what: "Rating factors pulled from submission", ctx: s.id, conf: "—" },
  ]);

  const { role } = useRole();
  const isJunior = role === "junior";

  const q = useMemo(() => rate(base, { deductibleK: ded, limitM: limit, endorsements: ends }), [base, ded, limit, ends]);
  const overCap = q.premium > JUNIOR_PREMIUM_CAP;
  const canApprove = !isJunior || !overCap;

  function log(entry: Omit<ActivityEntry, "at">) {
    setActivity((a) => [...a, { at: nowClock(), ...entry }]);
  }
  function toggleEnd(key: string) {
    setEnds((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }
  function selectSubmission(id: string) {
    setSelectedId(id);
    setDecision(null);
    setDed(25);
    setLimit(5);
    setEnds(ratePlan.endorsements.filter((e) => e.defaultOn).map((e) => e.key));
    setActivity([{ at: nowClock(), who: "AI · Decision Core", what: "Rating factors pulled from submission", ctx: id, conf: "—" }]);
  }
  function approve() {
    setDecision({ action: "approved", label: `Quote approved · ${money(q.premium)}` });
    log({ who: "Priya R. (UW)", what: `Approved quote — ${money(q.premium)}`, ctx: `ded $${ded}k · $${limit}M limit` });
  }
  function escalate() {
    setDecision({ action: "escalated", label: "Sent to senior" });
    log({ who: "Sofia A. (Jr UW)", what: "Sent quote to senior for approval", ctx: `${money(q.premium)} above authority` });
  }
  function generatePdf() {
    log({ who: "Priya R. (UW)", what: "Generated quote PDF", ctx: `${money(q.premium)}` });
  }
  function sendToBroker() {
    log({ who: "Priya R. (UW)", what: "Sent quote summary to Broker Copilot", ctx: s.broker });
  }

  const lrTone = q.projectedLossRatio <= ratePlan.targetLossRatio ? "success" : "warn";

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 05"
        title="Quoting & Rating Support"
        description="Rating factors pulled from the submission, priced against the rate plan and appetite. Adjust terms live — the underwriter approves every quote."
        actions={
          <>
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
              <span className="inline-block h-1 w-1 rounded-full bg-accent/70" /> Illustrative rating
            </span>
            <Button variant="secondary" onClick={generatePdf}><Download className="h-4 w-4" />Generate quote PDF</Button>
          </>
        }
      />

      {/* Submission selector */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Quoting for</span>
        {quotable.map((row) => (
          <button
            key={row.id}
            onClick={() => selectSubmission(row.id)}
            className={cn("rounded-lg border px-2.5 py-1 text-xs transition", selectedId === row.id ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40")}
          >
            {row.insured.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      {/* Eligibility gate */}
      {!base.inAppetite && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 text-sm">
          <ShieldAlert className="h-5 w-5 shrink-0 text-destructive" />
          <div><b className="text-destructive">Out of appetite — not quotable.</b> <span className="text-ink-soft">This risk fails a hard appetite rule; resolve in Submission Triage before quoting.</span></div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        {/* Configuration */}
        <Panel title="Configuration" subtitle={`${s.insured} · ${s.lob}`}>
          <div className="space-y-5">
            <FieldGroup label="Coverage form">
              <select className="w-full rounded-lg border border-border bg-background p-2 text-sm">
                <option>ISO CP 00 10 10 12 — Special Form</option>
                <option>ISO CP 00 20 10 12 — Broad Form</option>
              </select>
            </FieldGroup>
            <FieldGroup label={`Deductible: $${ded}k`}>
              <input type="range" min={10} max={100} step={5} value={ded} onChange={(e) => setDed(Number(e.target.value))} className="w-full accent-accent" />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>$10k</span><span>$100k</span></div>
            </FieldGroup>
            <FieldGroup label={`Excess limit: $${limit}M`}>
              <input type="range" min={1} max={25} step={1} value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="w-full accent-accent" />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground"><span>$1M</span><span>$25M</span></div>
            </FieldGroup>
            <FieldGroup label="Endorsements">
              <div className="space-y-1.5 text-sm">
                {ratePlan.endorsements.map((e) => (
                  <label key={e.key} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <input type="checkbox" checked={ends.includes(e.key)} onChange={() => toggleEnd(e.key)} className="accent-accent" />
                      {e.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">+{(e.loading * 100).toFixed(1)}%</span>
                  </label>
                ))}
              </div>
            </FieldGroup>
            <div className="rounded-lg border border-border bg-secondary/40 p-3 text-[11px] text-muted-foreground">
              Inputs pulled from{" "}
              <Link to="/app/workflows/submission-triage" className="text-foreground underline-offset-2 hover:text-accent hover:underline">{s.id}</Link> · TIV {s.tiv} · class {s.industry}.
            </div>
          </div>
        </Panel>

        {/* Indicated premium + rationale */}
        <div className="space-y-5">
          <Panel title="Indicated premium" actions={<FoundationBadge />}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Annual premium</div>
                <div className="mt-1 font-serif text-5xl leading-none">{money(q.premium)}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Band {money(q.band[0])}–{money(q.band[1])} · rate ${q.ratePer1kTIV.toFixed(2)}/$1k TIV · commission {money(q.commission)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="Loss ratio (proj.)" value={`${(q.projectedLossRatio * 100).toFixed(0)}%`} sub={`target ${(ratePlan.targetLossRatio * 100).toFixed(0)}%`} tone={lrTone} />
                <MetricTile label="Combined ratio" value={`${(q.combinedRatio * 100).toFixed(0)}%`} sub="incl. expense" tone={q.combinedRatio <= 1 ? "success" : "warn"} />
              </div>
            </div>

            {/* Cited factor breakdown */}
            <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" /> Rating rationale · {ratePlan.version}
              </div>
              <ul className="divide-y divide-border/70 text-sm">
                {q.factors.map((f, i) => (
                  <li key={i} className="flex items-start justify-between gap-3 py-1.5">
                    <div className="min-w-0">
                      <div className="truncate">{f.label}</div>
                      <div className="text-[10px] text-muted-foreground">{f.source}</div>
                    </div>
                    <div className={cn("shrink-0 font-mono text-xs", i === 0 ? "text-foreground" : f.contribution >= 0 ? "text-destructive" : "text-success")}>
                      {i === 0 ? money(f.contribution) : signed(f.contribution)}
                    </div>
                  </li>
                ))}
                <li className="flex items-center justify-between gap-3 py-2 font-medium">
                  <span>Indicated premium</span>
                  <span className="font-mono">{money(q.premium)}</span>
                </li>
              </ul>
            </div>

            {/* Eligibility + versions */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
              {base.inAppetite ? (
                <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" /> Eligible — in appetite</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-destructive"><AlertTriangle className="h-3 w-3" /> Not eligible — out of appetite</span>
              )}
              <span>·</span>
              <span className="inline-flex items-center gap-1"><Gavel className="h-3 w-3 text-accent" />{ratePlan.version}</span>
              <span>·</span>
              <span>
                appetite via{" "}
                <Link to="/app/workflows/rules-console" className="text-foreground underline-offset-2 hover:text-accent hover:underline">Rules Console</Link>
              </span>
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              {decision ? (
                <Chip tone={decision.action === "escalated" ? "accent" : "success"}><CheckCircle2 className="h-3 w-3" /> {decision.label}</Chip>
              ) : (
                <>
                  <Link
                    to={"/app/workflows/broker-copilot" as any}
                    onClick={sendToBroker}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm transition hover:bg-secondary"
                  >
                    <Mail className="h-4 w-4" />Send summary to broker <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  {canApprove ? (
                    <Button variant="primary" onClick={approve} disabled={!base.inAppetite}><CheckCircle2 className="h-4 w-4" />Approve quote</Button>
                  ) : (
                    <Button variant="primary" onClick={escalate} disabled={!base.inAppetite}>Send to senior <ArrowUpRight className="h-4 w-4" /></Button>
                  )}
                </>
              )}
              {isJunior && !decision && (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                  Your authority: quotes up to ${JUNIOR_PREMIUM_CAP.toLocaleString()}.{overCap ? " This quote is above your limit." : ""}
                </span>
              )}
            </div>
          </Panel>

          {/* Compare options */}
          <Panel title="Compare quote options" subtitle="Same rate plan · click to load">
            <div className="grid gap-3 md:grid-cols-3">
              {PRESETS.map((p) => {
                const pr = rate(base, { deductibleK: p.deductibleK, limitM: p.limitM, endorsements: ends });
                const active = ded === p.deductibleK && limit === p.limitM;
                return (
                  <button
                    key={p.name}
                    onClick={() => { setDed(p.deductibleK); setLimit(p.limitM); }}
                    className={cn("rounded-xl border p-4 text-left transition", active ? "border-foreground bg-secondary/60" : "border-border hover:border-foreground/40")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{p.name}</div>
                      {active && <Chip tone="accent">Selected</Chip>}
                    </div>
                    <div className="mt-3 font-serif text-2xl">{money(pr.premium)}</div>
                    <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
                      <div>Deductible ${p.deductibleK}k</div>
                      <div>Excess ${p.limitM}M</div>
                      <div className="inline-flex items-center gap-1">
                        Projected LR {(pr.projectedLossRatio * 100).toFixed(0)}%
                        {pr.projectedLossRatio <= ratePlan.targetLossRatio ? <TrendingDown className="h-3 w-3 text-success" /> : <TrendingUp className="h-3 w-3 text-warn" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Panel>

          {/* Activity */}
          <Panel title="Activity" subtitle="Rating · quote · approval — audited">
            <ul className="divide-y divide-border">
              {[...activity].reverse().map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 text-sm">
                  <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.at}</span>
                  <div className="flex-1"><div><b>{a.who}</b> — {a.what}</div>{a.ctx && <div className="text-[11px] text-muted-foreground">{a.ctx}</div>}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "success" | "warn" | "danger" }) {
  const border = tone === "success" ? "border-success/30" : tone === "warn" ? "border-warn/30" : "border-destructive/30";
  return (
    <div className={`rounded-xl border ${border} bg-secondary/30 p-4`}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-2xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
