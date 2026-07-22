import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Upload,
  Sparkles,
  Search,
  Filter,
  Building2,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Scan,
  Gavel,
  Pencil,
  Save,
  Mail,
  RotateCcw,
  ShieldAlert,
  Copy,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole, JUNIOR_PREMIUM_CAP, parseMoney } from "./role";
import { useDecisions } from "./decisions";
import {
  submissions,
  getTriageDetail,
  RECOMMENDATION_LABEL,
  nowClock,
  type Submission,
  type TriageDetail,
  type TriageRecommendation,
  type ExtractedField,
  type ActivityEntry,
} from "./mocks";

/* ============================================================
   Submission Triage — PRD-aligned clickable prototype.
   No backend: all state is local React state seeded from the
   mock detail model in mocks.ts. Every action (filter, edit,
   override, classify, draft email, approve) is wired and logs
   to the submission's activity in-session.
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
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
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
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...p}>
      {children}
    </button>
  );
}

function FoundationBadge({ kind }: { kind: "extraction" | "decision" }) {
  const isExt = kind === "extraction";
  return (
    <Link
      to={isExt ? "/app/foundation/extraction-core" : "/app/foundation/decision-core"}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-foreground/40"
      title="Reused platform capability"
    >
      {isExt ? <Scan className="h-3 w-3 text-accent" /> : <Gavel className="h-3 w-3 text-accent" />}
      {isExt ? "Extraction Core" : "Decision Core"}
    </Link>
  );
}

function recTone(rec: TriageRecommendation) {
  return rec === "PROCEED" ? "success" : rec === "DECLINE" ? "danger" : "warn";
}
function RecPill({ rec }: { rec: TriageRecommendation }) {
  const Icon = rec === "PROCEED" ? CheckCircle2 : rec === "DECLINE" ? AlertTriangle : Info;
  return (
    <Chip tone={recTone(rec)}>
      <Icon className="h-3 w-3" /> {RECOMMENDATION_LABEL[rec]}
    </Chip>
  );
}

function ScorePill({ value }: { value: number }) {
  if (value === 0) return <Chip tone="neutral">…</Chip>;
  const tone = value >= 80 ? "success" : value >= 60 ? "warn" : "danger";
  return <Chip tone={tone}>Score {value}</Chip>;
}

/* ---------------------------- filters ---------------------------- */

const FILTERS = ["All open", "In appetite", "Marginal", "Needs info", "Declined"] as const;
type FilterKey = (typeof FILTERS)[number];

function matchesFilter(s: Submission, f: FilterKey): boolean {
  switch (f) {
    case "In appetite":
      return s.appetite === "In appetite";
    case "Marginal":
      return s.appetite === "Marginal";
    case "Needs info":
      return s.recommendation === "Request info";
    case "Declined":
      return s.recommendation === "Decline" || s.status === "Declined";
    default:
      return true;
  }
}

/* ---------------------------- main ---------------------------- */

type Decision = { action: "approved" | "overridden" | "info_requested" | "escalated" | null; label?: string };

export function SubmissionTriage() {
  const [selected, setSelected] = useState(submissions[0].id);
  const [filter, setFilter] = useState<FilterKey>("All open");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Documents");

  // Per-submission mutable state (seeded from mock detail) — stands in for a backend record.
  const [details, setDetails] = useState<Record<string, TriageDetail>>(() =>
    Object.fromEntries(submissions.map((s) => [s.id, structuredClone(getTriageDetail(s))])),
  );
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  // UI modals / modes
  const [editMode, setEditMode] = useState(false);
  const [override, setOverride] = useState<TriageRecommendation | null>(null);
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [draftOpen, setDraftOpen] = useState(false);

  const { role } = useRole();
  const isJunior = role === "junior";
  const { record } = useDecisions();

  const s = submissions.find((x) => x.id === selected)!;
  const d = details[selected];
  const decision = decisions[selected] ?? { action: null };
  const overCap = parseMoney(s.premium) > JUNIOR_PREMIUM_CAP;
  const canDecide = !isJunior || (!overCap && d.hardRulePassed && d.recommendation !== "DECLINE");

  const filtered = useMemo(
    () =>
      submissions.filter((row) => {
        if (!matchesFilter(row, filter)) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return [row.insured, row.broker, row.brokerage, row.id, row.state].some((v) => v.toLowerCase().includes(q));
      }),
    [filter, query],
  );

  const counts = useMemo(
    () => ({
      today: submissions.length,
      awaiting: submissions.filter((x) => x.status === "New" || x.status === "Extracting" || x.status === "Scored" || x.status === "In review").length,
      attention: Object.entries(details).filter(([, det]) => det.processing !== "ready").length,
    }),
    [details],
  );

  function logActivity(entry: Omit<ActivityEntry, "at">) {
    setDetails((prev) => ({
      ...prev,
      [selected]: { ...prev[selected], activity: [...prev[selected].activity, { at: nowClock(), ...entry }] },
    }));
  }

  function saveFields(next: ExtractedField[]) {
    setDetails((prev) => ({ ...prev, [selected]: { ...prev[selected], fields: next } }));
  }

  function classifyDoc(name: string, kind: string) {
    setDetails((prev) => {
      const det = prev[selected];
      return {
        ...prev,
        [selected]: {
          ...det,
          docs: det.docs.map((doc) => (doc.name === name ? { ...doc, kind, classified: true, confidence: 0.95 } : doc)),
        },
      };
    });
    logActivity({ who: "Priya R. (UW)", what: `Classified ${name} as ${kind}` });
  }

  function reprocess() {
    setDetails((prev) => ({ ...prev, [selected]: { ...prev[selected], processing: "ready" } }));
    logActivity({ who: "Priya R. (UW)", what: "Re-ran processing", ctx: "manual retry" });
  }

  function escalate() {
    setDecisions((prev) => ({ ...prev, [selected]: { action: "escalated", label: "Escalated to senior" } }));
    const ctx = overCap ? "above authority limit" : !d.hardRulePassed ? "hard-rule appetite fail" : "decline decision";
    logActivity({ who: "Sofia A. (Jr UW)", what: "Escalated to senior underwriter", ctx });
    record({ actor: "human", who: "Sofia A. (Jr UW)", what: "Escalated to senior", ctx: `${s.insured} · ${ctx}`, workflow: "Submission Triage" });
  }

  function approve() {
    setDecisions((prev) => ({ ...prev, [selected]: { action: "approved", label: RECOMMENDATION_LABEL[d.recommendation] } }));
    logActivity({ who: "Priya R. (UW)", what: `Approved recommendation — ${RECOMMENDATION_LABEL[d.recommendation]}`, ctx: "AI + underwriter co-sign" });
    record({ actor: "human", who: "Priya R. (UW)", what: `Approved — ${RECOMMENDATION_LABEL[d.recommendation]}`, ctx: s.insured, workflow: "Submission Triage" });
  }
  function requestInfo() {
    setDecisions((prev) => ({ ...prev, [selected]: { action: "info_requested", label: "Request info" } }));
    setDraftOpen(true);
  }
  function confirmOverride() {
    if (!override) return;
    setDecisions((prev) => ({ ...prev, [selected]: { action: "overridden", label: `Override → ${RECOMMENDATION_LABEL[override]}` } }));
    logActivity({ who: "Priya R. (UW)", what: `Override → ${RECOMMENDATION_LABEL[override]}`, ctx: overrideReason || "no reason given" });
    record({ actor: "human", who: "Priya R. (UW)", what: `Override → ${RECOMMENDATION_LABEL[override]}`, ctx: `${s.insured} · ${overrideReason || "no reason"}`, workflow: "Submission Triage" });
    setOverride(null);
    setOverrideReason("");
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 01"
        title="Submission Triage"
        description="Email → extraction → risk analysis → appetite check → recommendation. Every submission, human-approved."
        actions={
          <>
            <Button variant="secondary"><Upload className="h-4 w-4" />Upload submission</Button>
            <Button variant="primary"><Sparkles className="h-4 w-4" />Run batch triage</Button>
          </>
        }
      />

      {/* filters + search (functional) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition",
                filter === f ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-secondary text-foreground hover:border-foreground/30",
              )}
            >
              {f}
            </button>
          ))}
          {counts.attention > 0 && (
            <button
              onClick={() => setFilter("All open")}
              className="ml-1 inline-flex items-center gap-1 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[11px] font-medium text-warn"
              title="Submissions still processing or in an error state"
            >
              <ShieldAlert className="h-3 w-3" /> {counts.attention} need attention
            </button>
          )}
        </div>
        <div className="flex w-72 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by insured, broker, id…"
            className="flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.7fr)]">
        {/* Inbox */}
        <Panel title="Submission inbox" subtitle={`${counts.today} today · ${counts.awaiting} awaiting review`}>
          <div className="divide-y divide-border">
            {filtered.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">No submissions match this filter.</div>}
            {filtered.map((row) => {
              const det = details[row.id];
              const dec = decisions[row.id];
              const busy = det.processing !== "ready";
              return (
                <button
                  key={row.id}
                  onClick={() => {
                    setSelected(row.id);
                    setEditMode(false);
                    setTab("Documents");
                  }}
                  className={cn("flex w-full items-start gap-3 py-3 text-left transition hover:bg-secondary/40", selected === row.id && "bg-secondary/50")}
                >
                  <div className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", busy ? "animate-pulse bg-accent" : "bg-transparent")} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{row.insured}</span>
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{row.received}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="truncate">{row.brokerage}</span>·<span>{row.state}</span>·<span className="font-mono">{row.premium}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {busy ? (
                        <Chip tone="accent">{det.processing === "extracting" ? "Extracting…" : det.processing === "queued" ? "Queued" : "Error"}</Chip>
                      ) : (
                        <RecPill rec={det.recommendation} />
                      )}
                      <Chip tone={row.appetite === "In appetite" ? "success" : row.appetite === "Marginal" ? "warn" : "danger"}>{row.appetite}</Chip>
                      {!busy && <span className="font-mono text-[10px] text-muted-foreground">{Math.round(det.confidence * 100)}% conf.</span>}
                      {dec?.action && <Chip tone="neutral">✓ {dec.label}</Chip>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        {/* Detail */}
        <div className="space-y-5">
          {/* Processing banner (queued/extracting/error) */}
          {d.processing !== "ready" && (
            <div className="flex items-center gap-3 rounded-xl border border-warn/30 bg-warn/5 p-4 text-sm">
              {d.processing === "error" ? <XCircle className="h-5 w-5 text-destructive" /> : <RotateCcw className="h-5 w-5 animate-spin text-accent" />}
              <div className="flex-1">
                <div className="font-medium">
                  {d.processing === "extracting" ? "Extraction in progress" : d.processing === "queued" ? "Queued for processing" : "Processing error"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {d.processing === "error"
                    ? "One or more documents failed to parse. This submission is held in the error queue — nothing was dropped."
                    : "The recommendation will appear once Extraction Core and Decision Core finish. No output is shown until it's ready."}
                </div>
              </div>
              <Button variant="secondary" onClick={reprocess}><RotateCcw className="h-4 w-4" />Reprocess</Button>
            </div>
          )}

          {/* Header card */}
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono text-[11px] text-muted-foreground">{s.id}</div>
                <h2 className="mt-1 font-serif text-2xl leading-tight">{s.insured}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{s.industry}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.state}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Effective {s.effective}</span>
                  <span>TIV {s.tiv}</span>
                  <span>Est. premium {s.premium}</span>
                </div>
              </div>
              {decision.action ? (
                <Chip tone={decision.action === "overridden" ? "warn" : decision.action === "escalated" ? "accent" : "success"}>
                  <CheckCircle2 className="h-3 w-3" /> {decision.label}
                </Chip>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={requestInfo}>Request info</Button>
                  {!isJunior && <Button variant="danger" onClick={() => setOverride("DECLINE")}>Decline</Button>}
                  {canDecide ? (
                    <Button variant="primary" onClick={approve}>
                      {isJunior ? "Approve" : "Proceed to quote"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={escalate}>
                      Escalate to senior <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {isJunior && !decision.action && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5 text-accent" />
                Your authority: approve up to ${JUNIOR_PREMIUM_CAP.toLocaleString()} premium.
                {overCap
                  ? " This submission is above your limit — route to a senior."
                  : !d.hardRulePassed
                    ? " Hard-rule declines are a senior decision."
                    : ""}
              </div>
            )}

            {/* Hard-rule DECLINE short-circuit banner */}
            {!d.hardRulePassed && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div>
                  <div className="font-serif text-lg text-destructive">Does not meet appetite</div>
                  <div className="mt-1 text-[13px] text-foreground">
                    Deterministic hard-rule decline — no risk score applied. {d.failedRules.join("; ")}.
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">Overriding requires Director-level approval with a written rationale.</div>
                </div>
              </div>
            )}

            {/* Metrics: score / appetite / recommendation + confidence */}
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MetricTile
                label="Risk score"
                value={d.hardRulePassed ? (s.score > 0 ? s.score.toString() : "—") : "n/a"}
                sub={d.hardRulePassed ? "Decision Core" : "skipped — hard-rule fail"}
                tone={!d.hardRulePassed ? "danger" : s.score >= 80 ? "success" : s.score >= 60 ? "warn" : "danger"}
              />
              <MetricTile
                label="Appetite"
                value={s.appetite}
                sub={`${d.appetite.filter((r) => r.pass).length} of ${d.appetite.length} rules pass`}
                tone={s.appetite === "In appetite" ? "success" : s.appetite === "Marginal" ? "warn" : "danger"}
              />
              <MetricTile
                label="Recommendation"
                value={RECOMMENDATION_LABEL[d.recommendation]}
                sub={`${Math.round(d.confidence * 100)}% confidence`}
                tone={recTone(d.recommendation)}
              />
            </div>

            {/* Rules version + processing metadata (FR-24 / output schema) */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Gavel className="h-3 w-3 text-accent" />
                Evaluated against{" "}
                <Link to="/app/workflows/rules-console" className="text-foreground underline-offset-2 hover:text-accent hover:underline">
                  Rules Console
                </Link>{" "}
                · {d.rulesVersion}
              </span>
              <span>·</span>
              <span>{d.meta.received.length} docs received</span>
              {d.meta.lowConfidence.length > 0 && <span className="text-warn">· {d.meta.lowConfidence.length} low-confidence</span>}
              <span>·</span>
              <span>{d.meta.timestamp}</span>
            </div>
          </Panel>

          {/* Tabs */}
          <Panel>
            <Tabs tabs={["Documents", "Extracted", "Risk analysis", "Appetite", "Recommendation", "Activity"]} value={tab} onChange={setTab} />
            <div className="mt-5">
              {tab === "Documents" && <DocumentsTab d={d} onClassify={classifyDoc} />}
              {tab === "Extracted" && <ExtractedTab key={selected} d={d} editMode={editMode} setEditMode={setEditMode} onSave={saveFields} onLog={logActivity} />}
              {tab === "Risk analysis" && <RiskTab d={d} />}
              {tab === "Appetite" && <AppetiteTab d={d} />}
              {tab === "Recommendation" && (
                <RecommendationTab
                  d={d}
                  decision={decision}
                  isJunior={isJunior}
                  canDecide={canDecide}
                  onApprove={approve}
                  onOverride={(r) => setOverride(r)}
                  onEscalate={escalate}
                  onDraft={() => setDraftOpen(true)}
                />
              )}
              {tab === "Activity" && <ActivityTab d={d} />}
            </div>
          </Panel>
        </div>
      </div>

      {/* Override modal (reason code) */}
      {override && (
        <OverrideModal
          rec={override}
          reason={overrideReason}
          setReason={setOverrideReason}
          onCancel={() => {
            setOverride(null);
            setOverrideReason("");
          }}
          onConfirm={confirmOverride}
        />
      )}

      {/* Draft request-info email modal */}
      {draftOpen && <DraftEmailModal s={s} d={d} onClose={() => setDraftOpen(false)} onSent={() => { logActivity({ who: "Priya R. (UW)", what: "Sent request-info email to broker", ctx: s.brokerage }); setDraftOpen(false); }} />}
    </div>
  );
}

/* ---------------------------- shared bits ---------------------------- */

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

function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-secondary/60 p-1 text-xs">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`rounded-md px-3 py-1.5 transition ${value === t ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------- Documents tab ---------------------------- */

function DocumentsTab({ d, onClassify }: { d: TriageDetail; onClassify: (name: string, kind: string) => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">{d.docs.length} documents · {d.meta.received.length} received</div>
          <FoundationBadge kind="extraction" />
        </div>
        <ul className="space-y-2 text-sm">
          {d.docs.map((doc) => (
            <li key={doc.name} className={cn("flex items-center gap-3 rounded-lg border p-3", doc.classified ? "border-border" : "border-warn/40 bg-warn/5")}>
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary"><FileText className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{doc.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {doc.classified ? `${doc.kind} · ${doc.pages}p · ${doc.fields} fields` : "Unclassified — needs manual review"}
                </div>
              </div>
              {doc.classified ? (
                <div className="text-right">
                  <div className={cn("font-mono text-xs", doc.confidence > 0.95 ? "text-success" : doc.confidence > 0.9 ? "text-warn" : "text-destructive")}>
                    {(doc.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">confidence</div>
                </div>
              ) : (
                <select
                  onChange={(e) => e.target.value && onClassify(doc.name, e.target.value)}
                  defaultValue=""
                  className="rounded-md border border-border bg-background px-2 py-1 text-[11px] outline-none"
                >
                  <option value="" disabled>Classify…</option>
                  {["ACORD 125", "ACORD 140", "SOV", "Loss Run", "Financials", "Inspection", "Other"].map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 text-[10px] text-muted-foreground">
          Low-confidence or unrecognized documents route to manual classification — they are surfaced here, never silently dropped.
        </div>
      </div>

      {/* Doc viewer with citations */}
      <div>
        <div className="mb-2 text-xs font-medium">Document viewer · {d.docs[0]?.name}</div>
        <div className="relative overflow-hidden rounded-lg border border-border bg-paper">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-6 font-mono text-[11px] text-ink-soft">
            {d.fields.slice(0, 6).map((f) => (
              <div key={f.key}>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</div>
                {f.value == null ? (
                  <div className="rounded bg-destructive/10 px-1 py-0.5 text-destructive">not in submitted documents</div>
                ) : (
                  <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">{f.value}</div>
                )}
              </div>
            ))}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
            {d.fields.filter((f) => f.value != null).length} fields cited
          </div>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">Every highlighted field is a citation — traceable to its source page.</div>
      </div>
    </div>
  );
}

/* ---------------------------- Extracted (editable) tab ---------------------------- */

function ExtractedTab({
  d,
  editMode,
  setEditMode,
  onSave,
  onLog,
}: {
  d: TriageDetail;
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  onSave: (f: ExtractedField[]) => void;
  onLog: (e: Omit<ActivityEntry, "at">) => void;
}) {
  // Re-seeded on submission change via the `key` prop from the parent.
  const [draft, setDraft] = useState<ExtractedField[]>(d.fields);

  const missingRequired = d.fields.filter((f) => f.required && (f.value == null || f.value === ""));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-medium">
          Extracted fields
          {missingRequired.length > 0 && <span className="ml-2 text-warn">· {missingRequired.length} required missing</span>}
        </div>
        <div className="flex items-center gap-2">
          <FoundationBadge kind="extraction" />
          {editMode ? (
            <Button
              variant="primary"
              className="!py-1 !text-xs"
              onClick={() => {
                onSave(draft);
                setEditMode(false);
                onLog({ who: "Priya R. (UW)", what: "Edited extracted fields" });
              }}
            >
              <Save className="h-3.5 w-3.5" />Save
            </Button>
          ) : (
            <Button variant="secondary" className="!py-1 !text-xs" onClick={() => setEditMode(true)}>
              <Pencil className="h-3.5 w-3.5" />Edit
            </Button>
          )}
        </div>
      </div>

      <ul className="divide-y divide-border rounded-lg border border-border">
        {(editMode ? draft : d.fields).map((f, i) => {
          const missing = f.required && (f.value == null || f.value === "");
          return (
            <li key={f.key} className="flex items-center gap-3 p-3 text-sm">
              <div className="w-40 shrink-0">
                <div className="font-medium">{f.label}</div>
                <div className="text-[10px] text-muted-foreground">{f.required ? "required" : "optional"}{f.source ? ` · ${f.source}` : ""}</div>
              </div>
              <div className="min-w-0 flex-1">
                {editMode ? (
                  <input
                    value={draft[i].value ?? ""}
                    placeholder="not in submitted documents"
                    onChange={(e) => setDraft((prev) => prev.map((x, j) => (j === i ? { ...x, value: e.target.value || null } : x)))}
                    className={cn("w-full rounded border bg-background px-2 py-1 text-sm outline-none focus:border-foreground/40", missing ? "border-warn/50" : "border-border")}
                  />
                ) : f.value == null ? (
                  <span className="inline-flex items-center gap-1.5 rounded bg-destructive/10 px-2 py-0.5 text-[12px] text-destructive">
                    <AlertTriangle className="h-3 w-3" /> not in submitted documents
                  </span>
                ) : (
                  <span className="text-foreground">{f.value}</span>
                )}
              </div>
              {!editMode && f.value != null && (
                <span className={cn("shrink-0 font-mono text-[10px]", f.confidence > 0.95 ? "text-success" : f.confidence > 0.85 ? "text-warn" : "text-destructive")}>
                  {Math.round(f.confidence * 100)}%
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-2 text-[10px] text-muted-foreground">
        Fields are editable and every correction is logged to Activity. Blank required fields are flagged; unavailable values read "not in submitted documents" — never guessed.
      </div>
    </div>
  );
}

/* ---------------------------- Risk tab ---------------------------- */

function RiskTab({ d }: { d: TriageDetail }) {
  const TrendIcon = d.loss.trend === "improving" ? TrendingUp : d.loss.trend === "worsening" ? TrendingDown : Minus;
  const trendTone = d.loss.trend === "improving" ? "text-success" : d.loss.trend === "worsening" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-medium">Risk factor breakdown</div>
            <FoundationBadge kind="decision" />
          </div>
          <ul className="divide-y divide-border rounded-lg border border-border">
            {d.factors.map((f) => (
              <li key={f.name} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground">{f.value}</div>
                </div>
                <span className={`font-mono text-xs ${f.weight >= 0 ? "text-success" : "text-destructive"}`}>{f.weight >= 0 ? "+" : ""}{f.weight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Loss-run derived metrics + trend (FR-15) */}
        <div>
          <div className="mb-2 text-xs font-medium">Loss-run summary (derived)</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-border p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total incurred</div><div className="mt-1 font-mono">{d.loss.totalIncurred}</div></div>
            <div className="rounded-lg border border-border p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total paid</div><div className="mt-1 font-mono">{d.loss.totalPaid}</div></div>
            <div className="rounded-lg border border-border p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Open claims</div><div className="mt-1 font-mono">{d.loss.openClaims}</div></div>
            <div className={cn("rounded-lg border p-3", d.loss.years < d.loss.required ? "border-warn/40 bg-warn/5" : "border-border")}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Years provided</div>
              <div className="mt-1 font-mono">{d.loss.years} / {d.loss.required} req.</div>
            </div>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 text-[12px]">
            <span className="text-muted-foreground">Frequency trend:</span>
            <span className={cn("inline-flex items-center gap-1 font-medium", trendTone)}><TrendIcon className="h-3.5 w-3.5" />{d.loss.trend}</span>
          </div>
        </div>
      </div>

      {/* Cross-doc consistency */}
      <div>
        <div className="mb-2 text-xs font-medium">Cross-document consistency</div>
        <div className="space-y-2 text-sm">
          {d.consistency.map((c) => {
            const Icon = c.status === "fail" ? XCircle : c.status === "warn" ? AlertTriangle : CheckCircle2;
            const tone = c.status === "fail" ? "text-destructive" : c.status === "warn" ? "text-warn" : "text-success";
            return (
              <div key={c.label} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
                <div>
                  <div className="font-medium">{c.label}</div>
                  <div className="text-[11px] text-muted-foreground">{c.detail}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Appetite tab ---------------------------- */

function AppetiteTab({ d }: { d: TriageDetail }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-medium">
          Appetite evaluation · {d.appetite.filter((r) => r.pass).length} of {d.appetite.length} rules pass
        </div>
        <FoundationBadge kind="decision" />
      </div>
      {!d.hardRulePassed && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
          <ShieldAlert className="h-4 w-4" /> A hard rule failed — this short-circuits to DECLINE without a risk score.
        </div>
      )}
      <ul className="divide-y divide-border rounded-lg border border-border">
        {d.appetite.map((r) => (
          <li key={r.rule} className="flex items-start gap-3 p-3 text-sm">
            {r.pass ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <AlertTriangle className={cn("mt-0.5 h-4 w-4 shrink-0", r.hard ? "text-destructive" : "text-warn")} />}
            <div className="flex-1">
              <div className="flex items-center gap-2 font-medium">
                {r.rule}
                {r.hard && <Chip tone="neutral">hard rule</Chip>}
              </div>
              <div className="text-[11px] text-muted-foreground">{r.detail}</div>
            </div>
            <Chip tone={r.pass ? "success" : r.hard ? "danger" : "warn"}>{r.pass ? "Pass" : r.hard ? "Fail" : "Review"}</Chip>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------- Recommendation tab ---------------------------- */

function RecommendationTab({
  d,
  decision,
  isJunior,
  canDecide,
  onApprove,
  onOverride,
  onEscalate,
  onDraft,
}: {
  d: TriageDetail;
  decision: Decision;
  isJunior: boolean;
  canDecide: boolean;
  onApprove: () => void;
  onOverride: (r: TriageRecommendation) => void;
  onEscalate: () => void;
  onDraft: () => void;
}) {
  const tone = recTone(d.recommendation);
  const border = tone === "success" ? "border-success/40 bg-success/5" : tone === "danger" ? "border-destructive/40 bg-destructive/5" : "border-warn/40 bg-warn/5";
  const Icon = d.recommendation === "PROCEED" ? CheckCircle2 : d.recommendation === "DECLINE" ? AlertTriangle : Info;
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className={`rounded-xl border-2 ${border} p-4 md:col-span-2`}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : "text-warn")} />
          <div className="font-serif text-xl">{RECOMMENDATION_LABEL[d.recommendation]}</div>
          <Chip tone={tone}>{Math.round(d.confidence * 100)}% confidence</Chip>
        </div>
        <p className="mt-3 text-sm text-foreground">{d.narrative}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.citations.map((c) => (
            <span key={c} className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              <FileText className="h-3 w-3" /> {c}
            </span>
          ))}
        </div>

        {/* Missing info list (FR-29) */}
        {d.missingInfo.length > 0 && (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-medium">Missing information ({d.missingInfo.length})</div>
              <Button variant="secondary" className="!py-1 !text-xs" onClick={onDraft}><Mail className="h-3.5 w-3.5" />Draft request-info email</Button>
            </div>
            <ul className="space-y-2">
              {d.missingInfo.map((m) => (
                <li key={m.item} className="flex items-start gap-2 text-[13px]">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", m.severity === "required" ? "bg-destructive" : "bg-warn")} />
                  <div>
                    <div className="font-medium">{m.item} <span className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground">{m.severity}</span></div>
                    <div className="text-[11px] text-muted-foreground">{m.reason}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Underwriter decision */}
      <div className="rounded-xl border border-border p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Underwriter decision</div>
        {decision.action ? (
          <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-success"><CheckCircle2 className="h-4 w-4" />{decision.label}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Logged to the audit trail. See the Activity tab.</div>
          </div>
        ) : isJunior ? (
          <div className="mt-3 space-y-2 text-sm">
            {canDecide ? (
              <Button variant="primary" className="w-full" onClick={onApprove}>Approve recommendation</Button>
            ) : (
              <Button variant="primary" className="w-full" onClick={onEscalate}>Escalate to senior</Button>
            )}
            <div className="rounded-lg border border-border bg-secondary/40 p-2.5 text-[11px] text-muted-foreground">
              Overrides and declines are senior-underwriter decisions. You can approve within your authority or escalate.
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-2 text-sm">
            <Button variant="primary" className="w-full" onClick={onApprove}>Approve recommendation</Button>
            <Button variant="secondary" className="w-full" onClick={() => onOverride("PROCEED")}>Override → Proceed</Button>
            <Button variant="secondary" className="w-full" onClick={() => onOverride("REQUEST_INFO")}>Override → Request info</Button>
            <Button variant="danger" className="w-full" onClick={() => onOverride("DECLINE")}>Override → Decline</Button>
          </div>
        )}
        <div className="mt-4 text-[11px] text-muted-foreground">Every decision, including overrides, is written to the audit log with a reason.</div>
      </div>
    </div>
  );
}

/* ---------------------------- Activity tab ---------------------------- */

function ActivityTab({ d }: { d: TriageDetail }) {
  return (
    <ul className="divide-y divide-border">
      {[...d.activity].reverse().map((a, i) => (
        <li key={i} className="flex items-start gap-3 py-3 text-sm">
          <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.at}</span>
          <div className="flex-1">
            <div><b>{a.who}</b> — {a.what}</div>
            {a.ctx && <div className="text-[11px] text-muted-foreground">{a.ctx}</div>}
          </div>
          {a.conf && a.conf !== "—" && <Chip tone="neutral">{a.conf}</Chip>}
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------- Override modal ---------------------------- */

const OVERRIDE_REASONS = ["Rate adequacy", "Loss trend", "Appetite exception", "Broker relationship", "Data correction", "Other"];

function OverrideModal({
  rec,
  reason,
  setReason,
  onCancel,
  onConfirm,
}: {
  rec: TriageRecommendation;
  reason: string;
  setReason: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-border bg-background p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="font-serif text-lg">Override → {RECOMMENDATION_LABEL[rec]}</div>
          <button onClick={onCancel} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">Pick a reason code — lightweight, for the feedback/eval loop. It's logged to the audit trail.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {OVERRIDE_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={cn("rounded-lg border px-3 py-1.5 text-sm transition", reason === r ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary")}
            >
              {r}
            </button>
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

/* ---------------------------- Draft email modal ---------------------------- */

function DraftEmailModal({ s, d, onClose, onSent }: { s: Submission; d: TriageDetail; onClose: () => void; onSent: () => void }) {
  const items = d.missingInfo.length > 0 ? d.missingInfo : [{ item: "Any outstanding documentation", reason: "", severity: "recommended" as const }];
  const body = `Hi ${s.broker.split(" ")[0]},

Thanks for the submission on ${s.insured}. To complete our review, could you please send the following:

${items.map((m, i) => `${i + 1}. ${m.item}${m.reason ? ` — ${m.reason}` : ""}`).join("\n")}

Once we have these we can turn around terms quickly. Happy to jump on a call if easier.

Best,
Priya`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-accent" />
            <div className="font-serif text-lg">Draft request-info email</div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 p-5 text-sm">
          <div className="text-[11px] text-muted-foreground">To: {s.broker} · {s.brokerage} — generated from the missing-info list, grounded in this submission. Nothing sends automatically.</div>
          <textarea defaultValue={body} rows={12} className="w-full resize-none rounded-lg border border-border bg-paper p-3 font-mono text-[12px] leading-relaxed outline-none focus:border-foreground/40" />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-4">
          <a href="/app/workflows/broker-copilot" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Open in Broker Copilot <ArrowUpRight className="h-3 w-3" />
          </a>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(body)}><Copy className="h-4 w-4" />Copy</Button>
            <Button variant="primary" onClick={onSent}>Mark as sent</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
