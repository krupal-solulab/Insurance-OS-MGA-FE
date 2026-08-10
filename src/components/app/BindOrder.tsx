import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Circle, ShieldCheck, ShieldAlert, FileCheck2, FileText, Send, Gavel, Clock, ArrowUpRight, WifiOff, AlertTriangle } from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole } from "./role";
import { useDecisions } from "./decisions";
import { bindOrders, nowClock, type BindCheck, type ActivityEntry } from "./mocks";
import {
  listBinds,
  getBind,
  runScenario,
  actOnBind,
  type BindDetailDTO,
  type BindRowDTO,
} from "@/lib/bind-issuance-api";

/* ============================================================
   Bind Order & Issuance (roadmap #7) — clickable queue with an
   illustrative local-state demo (unchanged) plus a real-backend
   "Bind & Issuance Review" panel, additive below it. That panel
   tries the actual Backend-AI-OS /api/mga/bind-issuance endpoint
   (MBI-01..MBI-07: worksheet fidelity, pre-bind subjectivity
   gating, final authority reconfirmation against CURRENT
   information, PAS write-back, issuance reconciliation,
   downstream trigger gating, post-bind obligation tracking).
   Falls back to a "backend unavailable" note if unreachable, so
   this screen still works standalone either way.
   ============================================================ */

const BIND_SCENARIOS = ["scenario_01", "scenario_02", "scenario_03", "scenario_04", "scenario_05", "scenario_06"];

function useBackendBinds(role: "junior" | "senior") {
  const [rows, setRows] = useState<BindRowDTO[] | null>(null);
  const [details, setDetails] = useState<Record<string, BindDetailDTO>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listBinds(role)
      .then(async (existing) => {
        if (cancelled) return;
        setConnected(true);
        let list = existing;
        if (list.length === 0) {
          await Promise.all(BIND_SCENARIOS.map((s) => runScenario(role, s).catch(() => null)));
          if (cancelled) return;
          list = await listBinds(role).catch(() => []);
        }
        if (cancelled || list.length === 0) return;
        const byId: Record<string, BindDetailDTO> = {};
        await Promise.all(
          list.map(async (row) => {
            const d = await getBind(role, row.id).catch(() => null);
            if (d) byId[row.id] = d;
          }),
        );
        if (cancelled) return;
        setDetails(byId);
        setRows(list);
      })
      .catch(() => {
        if (!cancelled) setConnected(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  return { rows, details, connected };
}

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
  const styles: Record<string, string> = { primary: "bg-foreground text-background hover:opacity-90", secondary: "border border-border bg-background hover:bg-secondary" };
  return <button className={`${base} ${styles[variant]} ${className}`} {...p}>{children}</button>;
}

type Decision = null | "issued" | "escalated";
type OrderState = { checks: BindCheck[]; decision: Decision; activity: ActivityEntry[] };

const gating = (checks: BindCheck[]) => checks.filter((c) => c.tier !== "routine").every((c) => c.cleared);

export function BindOrder() {
  const { role } = useRole();
  const isJunior = role === "junior";
  const { record } = useDecisions();
  const { rows: backendRows, details: backendDetails, connected: backendConnected } = useBackendBinds(role);
  const [selected, setSelected] = useState(bindOrders[0].id);
  const [state, setState] = useState<Record<string, OrderState>>(() =>
    Object.fromEntries(bindOrders.map((o) => [o.id, { checks: structuredClone(o.checks), decision: null, activity: [...o.activity] }])),
  );

  const o = bindOrders.find((x) => x.id === selected)!;
  const st = state[selected];
  const ready = gating(st.checks);
  const cleared = st.checks.filter((c) => c.cleared).length;

  function log(entry: Omit<ActivityEntry, "at">) { setState((p) => ({ ...p, [selected]: { ...p[selected], activity: [...p[selected].activity, { at: nowClock(), ...entry }] } })); }
  function toggle(id: string) {
    setState((p) => {
      const checks = p[selected].checks.map((c) => (c.id === id ? { ...c, cleared: !c.cleared } : c));
      return { ...p, [selected]: { ...p[selected], checks } };
    });
    const c = st.checks.find((x) => x.id === id)!;
    log({ who: "Priya R. (UW)", what: `${c.cleared ? "Reopened" : "Cleared"} — ${c.label}` });
  }
  function issue() {
    if (!ready) return;
    setState((p) => ({ ...p, [selected]: { ...p[selected], decision: "issued" } }));
    log({ who: "Priya R. (UW)", what: "Issued policy · wrote back to PAS", ctx: `${o.insured} · ${o.premium}` });
    record({ actor: "human", who: "Priya R. (UW)", what: `Bound policy — ${o.premium}`, ctx: o.insured, workflow: "Bind Order" });
  }
  function escalate() {
    setState((p) => ({ ...p, [selected]: { ...p[selected], decision: "escalated" } }));
    log({ who: "Sofia A. (Jr UW)", what: "Sent bind to senior for issuance" });
    record({ actor: "human", who: "Sofia A. (Jr UW)", what: "Escalated bind to senior", ctx: o.insured, workflow: "Bind Order" });
  }

  const packetReady = (label: string) =>
    st.decision === "issued" ? true : label === "PAS write-back" ? false : label === "Surplus-lines filing" ? st.checks.some((c) => c.label.includes("Surplus-lines") && c.cleared) : true;
  const clearedSubs = st.checks.filter((c) => c.kind === "subjectivity" && c.cleared);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 06"
        title="Bind Order & Policy Issuance"
        description="Approved risks ready to bind. Clear every subjectivity and compliance check, review the binder, then issue — nothing binds until conditions clear and a human approves."
        actions={<span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"><span className="inline-block h-1 w-1 rounded-full bg-accent/70" /> Illustrative</span>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
        {/* Bind queue */}
        <Panel title="Bind queue" subtitle="Approved · ready to bind">
          <ul className="divide-y divide-border">
            {bindOrders.map((row) => {
              const rs = state[row.id];
              const rReady = gating(rs.checks);
              return (
                <button key={row.id} onClick={() => setSelected(row.id)} className={cn("flex w-full flex-col gap-1.5 py-3 text-left transition", selected === row.id ? "bg-secondary/50" : "hover:bg-secondary/30")}>
                  <div className="flex items-center justify-between gap-2 text-sm"><span className="truncate font-medium">{row.insured}</span><span className="shrink-0 font-mono text-xs">{row.premium}</span></div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground"><span>{row.id} · {row.lob}</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{row.bindBy}</span></div>
                  <div>{rs.decision === "issued" ? <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Bound</Chip> : rs.decision === "escalated" ? <Chip tone="accent">With senior</Chip> : rReady ? <Chip tone="success">Ready</Chip> : <Chip tone="warn">Conditions open</Chip>}</div>
                </button>
              );
            })}
          </ul>
        </Panel>

        {/* Detail */}
        <div className="space-y-5">
          {/* Status */}
          <div className={cn("flex items-start gap-3 rounded-xl border-2 p-4", st.decision === "issued" ? "border-success/40 bg-success/5" : ready ? "border-success/40 bg-success/5" : "border-warn/40 bg-warn/5")}>
            {st.decision === "issued" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : ready ? <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warn" />}
            <div>
              <div className={cn("font-serif text-lg", st.decision === "issued" ? "text-success" : ready ? "text-success" : "text-warn")}>
                {st.decision === "issued" ? "Policy issued · written to PAS" : ready ? "Ready to bind" : `Blocked — ${st.checks.filter((c) => c.tier !== "routine" && !c.cleared).length} condition(s) outstanding`}
              </div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">{o.insured} · {o.premium} · effective {o.effective} · {cleared}/{o.checks.length} cleared</div>
            </div>
          </div>

          {/* Conditions + Binder side by side */}
          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Bind conditions" subtitle="Click to clear · material must clear" actions={<Gavel className="h-4 w-4 text-muted-foreground" />}>
              <ul className="space-y-2">
                {st.checks.map((c) => (
                  <li key={c.id} className={cn("flex items-start gap-3 rounded-lg border p-2.5", c.cleared ? "border-border" : c.tier === "routine" ? "border-border" : "border-warn/40 bg-warn/5")}>
                    <button onClick={() => !st.decision && toggle(c.id)} disabled={!!st.decision} className="mt-0.5 shrink-0" aria-label="toggle">
                      {c.cleared ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">{c.label}<Chip tone={c.kind === "compliance" ? "accent" : "neutral"}>{c.kind}</Chip>{c.tier === "routine" && <Chip tone="neutral">post-bind ok</Chip>}</div>
                      <div className="text-[11px] text-muted-foreground">{c.note}</div>
                    </div>
                    <Chip tone={c.cleared ? "success" : c.tier === "routine" ? "neutral" : "warn"}>{c.cleared ? "Cleared" : "Pending"}</Chip>
                  </li>
                ))}
              </ul>
            </Panel>

            {/* Bind-order document preview */}
            <Panel title="Bind order · binder draft" actions={<FileText className="h-4 w-4 text-muted-foreground" />}>
              <div className="rounded-lg border border-border bg-paper p-4 text-sm">
                <div className="font-serif text-lg">{o.insured}</div>
                <dl className="mt-2 space-y-1 text-[12px]">
                  {[["Line of business", o.lob], ["Premium", o.premium], ["Effective", o.effective], ["Bind by", o.bindBy]].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
                  ))}
                </dl>
                <div className="mt-3 border-t border-border pt-2">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Subjectivities satisfied</div>
                  <ul className="mt-1 space-y-0.5 text-[11px]">
                    {clearedSubs.length ? clearedSubs.map((c) => <li key={c.id} className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success" />{c.label}</li>) : <li className="text-muted-foreground">None cleared yet</li>}
                  </ul>
                </div>
              </div>
            </Panel>
          </div>

          {/* Recommendation + actions */}
          <Panel title="AI bind recommendation">
            <div className={cn("rounded-xl border-2 p-4", ready ? "border-success/40 bg-success/5" : "border-warn/40 bg-warn/5")}>
              <div className="flex items-center gap-2">{ready ? <CheckCircle2 className="h-5 w-5 text-success" /> : <ShieldAlert className="h-5 w-5 text-warn" />}<div className="font-serif text-lg">{ready ? "Ready to bind" : "Hold — conditions open"}</div></div>
              <p className="mt-2 text-sm">{ready ? `All material conditions satisfied. Premium ${o.premium}, effective ${o.effective}. Recommend issuing the binder to hold rate.` : `Outstanding: ${st.checks.filter((c) => c.tier !== "routine" && !c.cleared).map((c) => c.label).join(", ")}.`}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {st.decision === "issued" ? (
                <>
                  <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Policy issued</Chip>
                  <Link to={"/app/workflows/broker-copilot" as any} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs transition hover:bg-secondary">Send policy docs to broker <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </>
              ) : st.decision === "escalated" ? (
                <Chip tone="accent">Sent to senior</Chip>
              ) : isJunior ? (
                <>
                  <Button variant="primary" onClick={escalate} disabled={!ready}><Send className="h-4 w-4" />Send to senior to issue</Button>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldAlert className="h-3.5 w-3.5 text-accent" />Issuance is a senior action.</span>
                </>
              ) : (
                <Button variant="primary" onClick={issue} disabled={!ready} title={ready ? "Issue policy & write back to PAS" : "Clear all material conditions first"}><FileCheck2 className="h-4 w-4" />Issue policy · write to PAS</Button>
              )}
            </div>

            {/* Issuance packet */}
            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Issuance packet</div>
              <ul className="grid gap-1.5 sm:grid-cols-2 text-sm">
                {o.packet.map((p) => (
                  <li key={p.label} className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">{packetReady(p.label) ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}{p.label}</span>
                    <Chip tone={packetReady(p.label) ? "success" : "neutral"}>{packetReady(p.label) ? "Ready" : "Pending"}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/* Real bind & issuance review (backend-connected, MBI-01..MBI-07) */}
          <BindReviewPanel
            role={role}
            rows={backendRows}
            details={backendDetails}
            connected={backendConnected}
          />

          {/* Activity */}
          <Panel title="Activity">
            <ul className="divide-y divide-border">
              {[...st.activity].reverse().map((a, i) => (
                <li key={i} className="flex items-start gap-3 py-2.5 text-sm"><span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.at}</span><div className="flex-1"><div><b>{a.who}</b> — {a.what}</div>{a.ctx && <div className="text-[11px] text-muted-foreground">{a.ctx}</div>}</div></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/** Real backend bind orders (Workflow-06 dataset scenarios) — additive, shown alongside
 * the illustrative slider/checklist demo above rather than replacing it. */
function BindReviewPanel({
  role,
  rows,
  details,
  connected,
}: {
  role: "junior" | "senior";
  rows: BindRowDTO[] | null;
  details: Record<string, BindDetailDTO>;
  connected: boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const list = rows ?? [];
  const selected = sel ?? list[0]?.id ?? null;
  const detail = selected ? details[selected] : undefined;

  if (!connected) {
    return (
      <Panel title="Bind & issuance review" subtitle="Backend-connected · MBI-01..MBI-07">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
          <WifiOff className="h-3.5 w-3.5" />
          Backend unavailable — the illustrative bind queue above still works. Real worksheet-locked bind orders appear here automatically once the Bind Order & Issuance service is reachable.
        </div>
      </Panel>
    );
  }

  if (list.length === 0 || !detail) {
    return (
      <Panel title="Bind & issuance review" subtitle="Backend-connected · MBI-01..MBI-07">
        <div className="text-sm text-muted-foreground">No bind orders evaluated yet.</div>
      </Panel>
    );
  }

  function act(action: "approve" | "escalate") {
    if (!selected) return;
    actOnBind(role, selected, action).catch(() => {});
  }

  const blocked = detail.bindOrderStatus === "BLOCKED";
  const discrepancy = detail.issuanceReconciliation.status === "DISCREPANCY_FLAGGED";

  return (
    <Panel title="Bind & issuance review" subtitle={`Backend-connected · ${detail.namedInsured} · MBI-01..MBI-07`}>
      <div className="mb-3 flex flex-wrap gap-2">
        {list.map((r) => (
          <button
            key={r.id}
            onClick={() => setSel(r.id)}
            className={cn("rounded-lg border px-2.5 py-1 text-xs transition", selected === r.id ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40")}
          >
            {r.namedInsured.split(" ").slice(0, 2).join(" ")}
          </button>
        ))}
      </div>

      <div className={cn("flex items-start gap-3 rounded-xl border-2 p-4", blocked || discrepancy ? "border-warn/40 bg-warn/5" : "border-success/40 bg-success/5")}>
        {blocked || discrepancy ? <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warn" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />}
        <div>
          <div className={cn("font-serif text-lg", blocked || discrepancy ? "text-warn" : "text-success")}>
            {detail.bindOrderStatus === "READY" ? "Ready to bind" : detail.bindOrderStatus}
          </div>
          <p className="mt-1 text-[12px] text-ink-soft">{detail.rationale}</p>
        </div>
      </div>

      {detail.worksheetReference && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Gavel className="h-3 w-3 text-accent" />{detail.worksheetReference.worksheetId} · ${detail.worksheetReference.premium.toLocaleString()}</span>
          {detail.stalenessCheck && (
            <>
              <span>·</span>
              <span className={cn("inline-flex items-center gap-1", detail.stalenessCheck.exceedsThreshold ? "text-warn" : "")}>
                <Clock className="h-3 w-3" />
                {detail.stalenessCheck.daysSinceWorksheet != null ? `${detail.stalenessCheck.daysSinceWorksheet}d since worksheet` : "no staleness data"}
              </span>
            </>
          )}
        </div>
      )}

      {detail.authorityReconfirmation && detail.authorityReconfirmation.outcome !== "WITHIN_AUTHORITY" && (
        <div className="mt-3 rounded-lg border border-warn/40 bg-warn/5 p-3 text-[12px]">
          <div className="flex items-center gap-2 font-medium text-warn"><AlertTriangle className="h-3.5 w-3.5" />{detail.authorityReconfirmation.outcome.replace(/_/g, " ")}</div>
          {detail.authorityReconfirmation.referralDraftText && (
            <pre className="mt-2 whitespace-pre-wrap font-sans text-[11px] text-ink-soft">{detail.authorityReconfirmation.referralDraftText}</pre>
          )}
        </div>
      )}

      {detail.preBindSubjectivities.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Pre-bind subjectivities</div>
          <ul className="space-y-1.5 text-sm">
            {detail.preBindSubjectivities.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2">
                <span className="flex items-center gap-2">{s.status === "cleared" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-warn" />}{s.description}</span>
                <Chip tone={s.materiality === "material" ? "warn" : "neutral"}>{s.materiality}</Chip>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.issuanceReconciliation.discrepancyDetail.length > 0 && (
        <div className="mt-3 rounded-lg border-2 border-destructive/40 bg-destructive/5 p-3 text-[12px]">
          <div className="flex items-center gap-2 font-medium text-destructive"><ShieldAlert className="h-3.5 w-3.5" />Issuance discrepancy — never trust by default (MBI-05)</div>
          <ul className="mt-2 space-y-1">
            {detail.issuanceReconciliation.discrepancyDetail.map((d, i) => (
              <li key={i} className="text-ink-soft"><b>{d.field}:</b> bound {d.bound} vs. issued {d.issued}</li>
            ))}
          </ul>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Downstream: bind confirmation {detail.downstreamTriggersFired.bindConfirmation ? "fired" : "HELD"} · policy delivery {detail.downstreamTriggersFired.policyDelivered ? "fired" : "HELD"}
          </div>
        </div>
      )}

      {detail.postBindObligations.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Post-bind ongoing obligations (MBI-07 — never blocks binding)</div>
          <ul className="space-y-1 text-sm">
            {detail.postBindObligations.map((o, i) => (
              <li key={i} className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-accent" />{o.description}<Chip tone="neutral">reminders at {o.reminderDaysBefore.join("/")}d</Chip></li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
        <Button variant="primary" onClick={() => act("approve")} disabled={blocked}><FileCheck2 className="h-4 w-4" />Approve · write to PAS</Button>
        <Button variant="secondary" onClick={() => act("escalate")}>Send to senior</Button>
      </div>
    </Panel>
  );
}
