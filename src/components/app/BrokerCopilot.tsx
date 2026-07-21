import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  Sparkles,
  Gavel,
  ShieldAlert,
  CheckCircle2,
  Info,
  X,
  RotateCcw,
  Pencil,
  Save,
  Trash2,
  Clock,
  FileText,
  ArrowUpRight,
  Star,
  Mail,
} from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole } from "./role";
import {
  communicationQueue,
  COMM_TYPE_LABEL,
  nowClock,
  type CommDraft,
  type CommType,
  type CommStatus,
  type ActivityEntry,
} from "./mocks";

/* ============================================================
   Broker Communication Copilot — PRD-aligned clickable
   prototype. No backend: local state seeded from the mock
   draft queue. Every draft is generated FROM a Triage/Renewal
   decision. Human approves & sends every message — nothing
   sends automatically.
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

const TYPE_TONE: Record<CommType, "neutral" | "accent" | "success" | "warn" | "danger"> = {
  MISSING_INFO_REQUEST: "accent",
  CONSISTENCY_FLAG_FOLLOWUP: "warn",
  QUOTE_SUMMARY: "success",
  RENEWAL_TERMS_EXPLANATION: "accent",
  NON_RENEWAL_NOTICE: "danger",
  NO_RESPONSE_FOLLOWUP: "neutral",
};

const FILTERS: { key: string; label: string }[] = [
  { key: "All", label: "All" },
  { key: "MISSING_INFO_REQUEST", label: "Missing info" },
  { key: "CONSISTENCY_FLAG_FOLLOWUP", label: "Consistency" },
  { key: "QUOTE_SUMMARY", label: "Quote" },
  { key: "RENEWAL_TERMS_EXPLANATION", label: "Renewal" },
  { key: "NON_RENEWAL_NOTICE", label: "Non-renewal" },
  { key: "NO_RESPONSE_FOLLOWUP", label: "Follow-up" },
];

type DraftState = { body: string; status: CommStatus; reviewed: boolean; editedPct: number | null; sentToSenior?: boolean; activity: ActivityEntry[] };

function changedPct(orig: string, cur: string): number {
  if (orig === cur) return 0;
  const max = Math.max(orig.length, cur.length) || 1;
  let diff = Math.abs(orig.length - cur.length);
  const n = Math.min(orig.length, cur.length);
  for (let i = 0; i < n; i++) if (orig[i] !== cur[i]) diff++;
  return Math.min(100, Math.round((diff / max) * 100));
}

export function BrokerCopilot() {
  const [selected, setSelected] = useState(communicationQueue[0].id);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [editMode, setEditMode] = useState(false);

  const [state, setState] = useState<Record<string, DraftState>>(() =>
    Object.fromEntries(
      communicationQueue.map((d) => [
        d.id,
        {
          body: d.body,
          status: d.status,
          reviewed: false,
          editedPct: null,
          activity: [{ at: d.generatedAt.replace("Today · ", ""), who: "AI · Decision Core", what: `Drafted ${COMM_TYPE_LABEL[d.type]}`, ctx: `from ${d.sourceId}`, conf: "—" }],
        } as DraftState,
      ]),
    ),
  );

  const draft = communicationQueue.find((x) => x.id === selected)!;
  const st = state[selected];

  const filtered = useMemo(
    () =>
      communicationQueue.filter((d) => {
        if (filter !== "All" && d.type !== filter) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return [d.namedInsured, d.broker.name, d.broker.agency, d.subject].some((v) => v.toLowerCase().includes(q));
      }),
    [filter, query],
  );

  const pendingCompliance = useMemo(
    () => communicationQueue.filter((d) => d.requiresComplianceReview && !state[d.id].reviewed && state[d.id].status !== "SENT" && state[d.id].status !== "DISCARDED").length,
    [state],
  );

  function patch(id: string, next: Partial<DraftState>, log?: Omit<ActivityEntry, "at">) {
    setState((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...next, activity: log ? [...prev[id].activity, { at: nowClock(), ...log }] : prev[id].activity },
    }));
  }

  function saveEdit(body: string) {
    const pct = changedPct(draft.body, body);
    patch(selected, { body, editedPct: pct }, { who: "Priya R. (UW)", what: `Edited draft (${pct}% changed)` });
    setEditMode(false);
  }
  function regenerate() {
    patch(selected, { body: draft.body, editedPct: null }, { who: "AI · Decision Core", what: "Regenerated draft" });
    setEditMode(false);
  }
  function approveSend() {
    patch(selected, { status: "SENT" }, { who: "Priya R. (UW)", what: "Approved & sent", ctx: draft.broker.agency });
  }
  function discard() {
    patch(selected, { status: "DISCARDED" }, { who: "Priya R. (UW)", what: "Discarded draft" });
  }
  function toggleReviewed() {
    const next = !st.reviewed;
    patch(selected, { reviewed: next }, next ? { who: "Compliance", what: "Non-renewal notice compliance-reviewed" } : undefined);
  }
  function sendToSenior() {
    patch(selected, { sentToSenior: true }, { who: "Sofia A. (Jr UW)", what: "Sent to senior for review", ctx: `${COMM_TYPE_LABEL[draft.type]} — sensitive` });
  }

  const { role } = useRole();
  const isJunior = role === "junior";
  const juniorSensitive = isJunior && draft.sensitive;

  const resolved = st.status === "SENT" || st.status === "DISCARDED" || !!st.sentToSenior;
  const sendBlocked = draft.requiresComplianceReview && !st.reviewed;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 03"
        title="Broker Communication Copilot"
        description="Every broker email is drafted from a Triage or Renewal decision, tone-calibrated, and cited to source. You approve every send — nothing goes out automatically."
        actions={<Button variant="primary"><MessageSquare className="h-4 w-4" />New email</Button>}
      />

      {/* filters */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition", filter === f.key ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-secondary text-foreground hover:border-foreground/30")}
            >
              {f.label}
            </button>
          ))}
          {pendingCompliance > 0 && (
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <ShieldAlert className="h-3 w-3" /> {pendingCompliance} awaiting compliance
            </span>
          )}
        </div>
        <div className="flex w-72 items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search insured, broker, subject…" className="flex-1 bg-transparent outline-none" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Draft queue */}
        <Panel title="Draft queue" subtitle={`${filtered.length} drafts · generated from decisions`}>
          <ul className="divide-y divide-border">
            {filtered.length === 0 && <li className="py-8 text-center text-sm text-muted-foreground">No drafts match this filter.</li>}
            {filtered.map((d) => {
              const ds = state[d.id];
              return (
                <button
                  key={d.id}
                  onClick={() => { setSelected(d.id); setEditMode(false); }}
                  className={cn("flex w-full flex-col gap-1.5 py-3 text-left transition", selected === d.id ? "bg-secondary/50" : "hover:bg-secondary/30")}
                >
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate font-medium">{d.namedInsured}</span>
                    {d.requiresComplianceReview && !ds.reviewed && ds.status !== "SENT" && <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{d.broker.name} · {d.broker.agency}</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Chip tone={TYPE_TONE[d.type]}>{COMM_TYPE_LABEL[d.type]}</Chip>
                    {ds.status === "SENT" && <Chip tone="success">Sent</Chip>}
                    {ds.status === "DISCARDED" && <Chip tone="neutral">Discarded</Chip>}
                    {ds.status === "UNDER_COMPLIANCE_REVIEW" && !ds.reviewed && <Chip tone="danger">Compliance</Chip>}
                  </div>
                </button>
              );
            })}
          </ul>
        </Panel>

        {/* Draft detail */}
        <div className="space-y-5">
          <Panel>
            {/* header */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone={TYPE_TONE[draft.type]}>{COMM_TYPE_LABEL[draft.type]}</Chip>
                  <Chip tone="neutral"><Sparkles className="h-2.5 w-2.5 text-accent" /> {draft.tone}</Chip>
                  {draft.combined && <Chip tone="accent">Combined</Chip>}
                </div>
                <h2 className="mt-2 font-serif text-xl leading-tight">{draft.subject}</h2>
                <div className="mt-1 text-xs text-muted-foreground">To: {draft.broker.name} &lt;{draft.broker.email}&gt;</div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span>Generated from</span>
                  <Link to={draft.sourceRoute as any} className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-foreground hover:border-foreground/40">
                    {draft.sourceWorkflow === "Submission Triage" ? "Triage" : "Renewal"} · {draft.sourceId} <ArrowUpRight className="h-3 w-3" />
                  </Link>
                  <span>· {draft.generatedAt}</span>
                </div>
              </div>
              {resolved ? (
                <Chip tone={st.status === "SENT" ? "success" : st.sentToSenior ? "accent" : "neutral"}>
                  <CheckCircle2 className="h-3 w-3" /> {st.status === "SENT" ? "Sent" : st.sentToSenior ? "With senior review" : "Discarded"}
                </Chip>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" onClick={regenerate}><RotateCcw className="h-4 w-4" />Regenerate</Button>
                  {editMode ? null : <Button variant="secondary" onClick={() => setEditMode(true)}><Pencil className="h-4 w-4" />Edit</Button>}
                  <Button variant="danger" onClick={discard}><Trash2 className="h-4 w-4" />Discard</Button>
                  {juniorSensitive ? (
                    <Button variant="primary" onClick={sendToSenior} title="Sensitive communications are approved by a senior underwriter">
                      Send to senior for review <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button variant="primary" onClick={approveSend} disabled={sendBlocked} title={sendBlocked ? "Compliance review required before sending" : "Approve & send"}>
                      Approve & Send <Send className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* tone rationale */}
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-secondary/40 p-3 text-[12px] text-ink-soft">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
              <span><b>Tone: {draft.tone}.</b> {draft.toneWhy}</span>
            </div>

            {/* broker relationship context */}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
              {draft.broker.tenureYears != null ? (
                <>
                  <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-accent" />{draft.broker.volumeTier} volume · {draft.broker.tenureYears}-year relationship</span>
                </>
              ) : (
                <span className="inline-flex items-center gap-1"><Info className="h-3 w-3" />Relationship data unavailable — neutral tone by default</span>
              )}
              {draft.deadlineRef && <><span>·</span><span className="inline-flex items-center gap-1 text-warn"><Clock className="h-3 w-3" />{draft.deadlineRef}</span></>}
            </div>

            {/* compliance gate */}
            {draft.requiresComplianceReview && (
              <div className={cn("mt-4 rounded-xl border-2 p-4", st.reviewed ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5")}>
                <label className="flex items-start gap-2.5 text-[13px]">
                  <button type="button" onClick={toggleReviewed} disabled={resolved} className={cn("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-none border", st.reviewed ? "border-foreground bg-foreground text-background" : "border-destructive/60 bg-background")}>
                    {st.reviewed && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <span className={st.reviewed ? "text-foreground" : "text-destructive"}>
                    <b>Compliance review required.</b> Non-renewal notices carry state notice-period and content rules. This draft cannot be sent until the template is compliance-reviewed. Loss figures are intentionally excluded (TN-10).
                  </span>
                </label>
              </div>
            )}

            {/* body */}
            <div className="mt-4">
              {editMode ? (
                <EditBody initial={st.body} onCancel={() => setEditMode(false)} onSave={saveEdit} />
              ) : (
                <div className="rounded-xl border border-border bg-paper p-4 text-sm leading-relaxed text-foreground">
                  <pre className="whitespace-pre-wrap font-sans">{st.body}</pre>
                </div>
              )}
            </div>

            {/* citations */}
            <div className="mt-3">
              <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <FoundationBadge kind="decision" /> Grounded in
              </div>
              <div className="flex flex-wrap gap-1.5">
                {draft.citations.map((c) => (
                  <span key={c.claim} className="inline-flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" title={c.source}>
                    <FileText className="h-3 w-3" /> {c.claim}
                  </span>
                ))}
              </div>
            </div>

            {st.editedPct != null && st.editedPct > 0 && (
              <div className="mt-3 text-[11px] text-muted-foreground">Edit distance from AI draft: <b>{st.editedPct}%</b> changed — logged for the draft-usability metric.</div>
            )}

            <div className="mt-4 border-t border-border pt-3 text-[10px] text-muted-foreground">
              Nothing is sent automatically. Every message requires an explicit Approve &amp; Send.
            </div>
          </Panel>

          {/* Activity */}
          <Panel title="Activity" subtitle="Draft generated · edited · sent — audited">
            <ul className="divide-y divide-border">
              {[...st.activity].reverse().map((a, i) => (
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

function EditBody({ initial, onCancel, onSave }: { initial: string; onCancel: () => void; onSave: (v: string) => void }) {
  const [val, setVal] = useState(initial);
  return (
    <div>
      <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={12} className="w-full resize-y rounded-xl border border-border bg-paper p-4 font-sans text-sm leading-relaxed outline-none focus:border-foreground/40" />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(val)}><Save className="h-4 w-4" />Save edit</Button>
      </div>
    </div>
  );
}

function FoundationBadge({ kind }: { kind: "extraction" | "decision" }) {
  const isExt = kind === "extraction";
  return (
    <Link to={isExt ? "/app/foundation/extraction-core" : "/app/foundation/decision-core"} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-foreground/40">
      <Gavel className="h-3 w-3 text-accent" />
      {isExt ? "Extraction Core" : "Decision Core"}
    </Link>
  );
}
