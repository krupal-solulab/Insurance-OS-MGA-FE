import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Gavel, ShieldAlert, CheckCircle2, Search, Filter, ArrowUpRight, TrendingUp, MapPin, WifiOff, AlertTriangle, FileText } from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole, SeniorOnlyNote, parseMoney } from "./role";
import { useDecisions } from "./decisions";
import { brokers, monthlyPipeline, stateMix, submissions, renewals, getRenewalDetail, type ActivityEntry } from "./mocks";
import {
  listAudits,
  getAudit,
  runScenario,
  actOnAudit,
  type GovernanceDetailDTO,
  type GovernanceRowDTO,
} from "@/lib/appetite-governance-api";
import {
  listReports,
  getReport,
  runScenario as runPortfolioScenario,
  actOnReport,
  type PortfolioReportDetailDTO,
  type PortfolioReportRowDTO,
} from "@/lib/portfolio-reporting-api";

/* ============================================================
   Governance & Portfolio reporting — clickable, with an
   illustrative local decision-log demo (unchanged) plus a real-
   backend "Governance findings" panel, additive below it. That
   panel tries the actual Backend-AI-OS /api/mga/appetite-
   governance endpoint (AG-02..AG-07: decision trail aggregation
   + completeness, rule version drift, override pattern
   detection, audit report generation, portfolio concentration,
   human-reviewed suggestion queue). Falls back to a "backend
   unavailable" note if unreachable, so this screen still works
   standalone either way.
   ============================================================ */

const GOVERNANCE_SCENARIOS = ["scenario_01", "scenario_02", "scenario_03", "scenario_04", "scenario_05", "scenario_06"];

function useBackendGovernance(role: "junior" | "senior") {
  const [rows, setRows] = useState<GovernanceRowDTO[] | null>(null);
  const [details, setDetails] = useState<Record<string, GovernanceDetailDTO>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listAudits(role)
      .then(async (existing) => {
        if (cancelled) return;
        setConnected(true);
        let list = existing;
        if (list.length === 0) {
          await Promise.all(GOVERNANCE_SCENARIOS.map((s) => runScenario(role, s).catch(() => null)));
          if (cancelled) return;
          list = await listAudits(role).catch(() => []);
        }
        if (cancelled || list.length === 0) return;
        const byId: Record<string, GovernanceDetailDTO> = {};
        await Promise.all(
          list.map(async (row) => {
            const d = await getAudit(role, row.id).catch(() => null);
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

const PORTFOLIO_SCENARIOS = ["scenario_01", "scenario_02", "scenario_03", "scenario_04", "scenario_05", "scenario_06"];

function useBackendPortfolio(role: "junior" | "senior") {
  const [rows, setRows] = useState<PortfolioReportRowDTO[] | null>(null);
  const [details, setDetails] = useState<Record<string, PortfolioReportDetailDTO>>({});
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listReports(role)
      .then(async (existing) => {
        if (cancelled) return;
        setConnected(true);
        let list = existing;
        if (list.length === 0) {
          await Promise.all(PORTFOLIO_SCENARIOS.map((s) => runPortfolioScenario(role, s).catch(() => null)));
          if (cancelled) return;
          list = await listReports(role).catch(() => []);
        }
        if (cancelled || list.length === 0) return;
        const byId: Record<string, PortfolioReportDetailDTO> = {};
        await Promise.all(
          list.map(async (row) => {
            const d = await getReport(role, row.id).catch(() => null);
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
function Kpi({ label, value, sub, to }: { label: string; value: string; sub: string; to?: string }) {
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {to && <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <div className="mt-2 font-serif text-3xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </>
  );
  return to ? (
    <Link to={to as any} className="rounded-xl border border-border bg-background p-4 transition hover:border-foreground/40">{inner}</Link>
  ) : (
    <div className="rounded-xl border border-border bg-background p-4">{inner}</div>
  );
}

/* ============================== #8 Appetite Governance ============================== */

const overrideByRule = [
  { rule: "Loss ratio 5yr < 55%", overrides: 12, total: 148 },
  { rule: "TIV under $250M", overrides: 8, total: 132 },
  { rule: "Sawmill excluded", overrides: 6, total: 24 },
  { rule: "No open flood claim > $250k", overrides: 5, total: 61 },
  { rule: "Sprinklered ≥ 80% TIV", overrides: 4, total: 208 },
];
// Appetite drift computed from renewals that fail the current appetite rules.
function computeDrift() {
  return renewals
    .map((r) => ({ r, d: getRenewalDetail(r) }))
    .filter((x) => !x.d.hardRulePassed || x.d.recommendation === "NON_RENEW")
    .map((x) => ({
      insured: x.r.insured,
      detail: x.d.appetiteDrift ?? "Now fails current appetite rules — review non-renewal.",
      to: "/app/workflows/renewal-management",
    }));
}

export function AppetiteGovernance() {
  const { role } = useRole();
  const isJunior = role === "junior";
  const { entries, record } = useDecisions();
  const { rows: backendRows, details: backendDetails, connected: backendConnected } = useBackendGovernance(role);
  const [f, setF] = useState<"All" | "AI" | "Human">("All");
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [reported, setReported] = useState(false);
  const drift = useMemo(computeDrift, []);

  const rows = useMemo(
    () =>
      entries.filter((d) => {
        if (f === "AI" && d.actor !== "ai") return false;
        if (f === "Human" && d.actor !== "human") return false;
        if (q && ![d.who, d.what, d.ctx ?? ""].some((v) => v.toLowerCase().includes(q.toLowerCase()))) return false;
        return true;
      }),
    [entries, f, q],
  );

  const total = entries.length;
  const overrides = entries.filter((e) => /override/i.test(e.what)).length;
  const overrideRate = total ? ((overrides / total) * 100).toFixed(1) : "0";

  function generateReport() {
    setReported(true);
    setActivity((a) => [...a, { at: "now", who: "Priya R. (UW)", what: "Generated compliance report", ctx: `${total} decisions · ${overrides} overrides` }]);
    record({ actor: "human", who: "Priya R. (UW)", what: "Generated compliance report", ctx: `${total} decisions`, workflow: "Governance" });
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 07 · Governance"
        title="Appetite Governance & Audit"
        description="Every AI and human decision against appetite, over time — with override tracking, drift detection, and audit-ready reporting."
        actions={<Button variant="primary" onClick={generateReport} disabled={isJunior}><Download className="h-4 w-4" />Generate compliance report</Button>}
      />

      {isJunior && <SeniorOnlyNote>Viewing the audit trail is read-only for junior underwriters — compliance reporting is a senior action.</SeniorOnlyNote>}
      {reported && <div className="mb-4"><Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Compliance report generated — see Activity</Chip></div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Decisions logged" value={String(total)} sub="live · AI + human" />
        <Kpi label="Override rate" value={`${overrideRate}%`} sub={`${overrides} overrides`} />
        <Kpi label="Appetite drift" value={String(drift.length)} sub="accounts now failing" />
        <Kpi label="Avg AI confidence" value="91%" sub="+2pp vs Q4" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel
          title="Decision timeline"
          subtitle="Every AI and human decision — auditable"
          actions={
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-border px-2 py-1 text-xs md:flex">
                <Search className="h-3 w-3 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-28 bg-transparent outline-none" />
              </div>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </div>
          }
        >
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            {(["All", "AI", "Human"] as const).map((k) => (
              <button key={k} onClick={() => setF(k)} className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition", f === k ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-secondary hover:border-foreground/30")}>{k}</button>
            ))}
          </div>
          <ul className="divide-y divide-border">
            {[...rows].reverse().map((d, i) => (
              <li key={i} className="flex items-start gap-3 py-3 text-sm">
                <span className="mt-0.5 w-12 shrink-0 font-mono text-[10px] text-muted-foreground">{d.at}</span>
                <div className="flex-1"><div><b>{d.who}</b> — {d.what}</div>{d.ctx && <div className="text-[11px] text-muted-foreground">{d.ctx}</div>}</div>
                {d.workflow && <Chip>{d.workflow}</Chip>}
              </li>
            ))}
            {rows.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No matching decisions.</li>}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel title="Appetite drift" subtitle="Rules changed vs accounts affected">
            <ul className="space-y-2">
              {drift.map((x) => (
                <li key={x.insured} className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-sm">
                  <div className="flex items-center gap-1.5 font-medium"><ShieldAlert className="h-3.5 w-3.5 text-warn" />{x.insured}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{x.detail}</div>
                  <Link to={x.to as any} className="mt-1 inline-flex items-center gap-1 text-[11px] text-foreground hover:text-accent">Review <ArrowUpRight className="h-3 w-3" /></Link>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Overrides by rule">
            <ul className="divide-y divide-border">
              {overrideByRule.map((r) => (
                <li key={r.rule} className="flex items-center gap-3 py-2.5 text-sm">
                  <Link to="/app/workflows/rules-console" className="flex-1 hover:text-accent">{r.rule}</Link>
                  <span className="font-mono text-[11px] text-muted-foreground">{r.overrides}/{r.total}</span>
                  <span className="w-10 text-right font-mono text-xs">{((r.overrides / r.total) * 100).toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Real backend governance findings (backend-connected, AG-02..AG-07) */}
      <GovernanceFindingsPanel
        role={role}
        rows={backendRows}
        details={backendDetails}
        connected={backendConnected}
      />

      {activity.length > 0 && (
        <Panel title="Activity" className="mt-5">
          <ul className="divide-y divide-border">
            {[...activity].reverse().map((a, i) => (
              <li key={i} className="flex items-start gap-3 py-2.5 text-sm"><span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.at}</span><div className="flex-1"><div><b>{a.who}</b> — {a.what}</div><div className="text-[11px] text-muted-foreground">{a.ctx}</div></div></li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

/** Real backend governance analysis (Workflow-07 dataset scenarios) — additive, shown
 * below the illustrative decision-log demo above rather than replacing it. */
function GovernanceFindingsPanel({
  role,
  rows,
  details,
  connected,
}: {
  role: "junior" | "senior";
  rows: GovernanceRowDTO[] | null;
  details: Record<string, GovernanceDetailDTO>;
  connected: boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const list = rows ?? [];
  const selected = sel ?? list[0]?.id ?? null;
  const detail = selected ? details[selected] : undefined;

  if (!connected) {
    return (
      <Panel title="Governance findings" subtitle="Backend-connected · AG-02..AG-07" className="mt-5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
          <WifiOff className="h-3.5 w-3.5" />
          Backend unavailable — the illustrative decision log above still works. Real aggregated audit findings appear here automatically once the Appetite Governance service is reachable.
        </div>
      </Panel>
    );
  }

  if (list.length === 0 || !detail) {
    return (
      <Panel title="Governance findings" subtitle="Backend-connected · AG-02..AG-07" className="mt-5">
        <div className="text-sm text-muted-foreground">No governance analyses evaluated yet.</div>
      </Panel>
    );
  }

  function act(action: "approve" | "escalate" | "send") {
    if (!selected) return;
    actOnAudit(role, selected, action).catch(() => {});
  }

  return (
    <Panel title="Governance findings" subtitle={`Backend-connected · ${detail.period} · AG-02..AG-07`} className="mt-5">
      <div className="mb-3 flex flex-wrap gap-2">
        {list.map((r) => (
          <button
            key={r.id}
            onClick={() => setSel(r.id)}
            className={cn("rounded-lg border px-2.5 py-1 text-xs transition", selected === r.id ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40")}
          >
            {r.period}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-3 text-[12px] text-ink-soft">{detail.rationale}</div>

      {detail.decisionTrail.gaps.length > 0 && (
        <div className="mt-3 rounded-lg border-2 border-warn/40 bg-warn/5 p-3 text-[12px]">
          <div className="flex items-center gap-2 font-medium text-warn"><AlertTriangle className="h-3.5 w-3.5" />Data gap — flagged, never smoothed over</div>
          <ul className="mt-2 space-y-1 text-ink-soft">
            {detail.decisionTrail.gaps.map((g, i) => (
              <li key={i}><b>{g.dateRange}:</b> {g.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {detail.ruleVersionDriftFindings.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Rule version drift (AG-03)</div>
          <ul className="space-y-2 text-sm">
            {detail.ruleVersionDriftFindings.map((f, i) => (
              <li key={i} className={cn("rounded-lg border p-3", f.stillQualifies ? "border-border" : "border-warn/40 bg-warn/5")}>
                <div className="flex items-center gap-1.5 font-medium"><ShieldAlert className="h-3.5 w-3.5 text-warn" />{f.insured} · {f.policyNumber}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{f.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.overridePatternFindings.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Override pattern detection (AG-04)</div>
          <ul className="divide-y divide-border">
            {detail.overridePatternFindings.map((f, i) => (
              <li key={i} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{f.underwriter}</span>
                  <Chip tone={f.flagged ? "warn" : "success"}>{f.flagged ? "Suggestion generated" : "Suppressed"}</Chip>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{f.overrideCount} override(s) · {f.undocumentedCount} undocumented</div>
                {f.suggestion && <div className="mt-1 text-[12px] text-ink-soft">{f.suggestion}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.portfolioConcentrationFindings.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Portfolio concentration (AG-06)</div>
          <ul className="space-y-2 text-sm">
            {detail.portfolioConcentrationFindings.map((f, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{f.classCode} · {f.carrier}</span>
                  {f.lowVolumeFlag && <Chip tone="neutral">low volume</Chip>}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{f.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.auditReport && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-[12px]">
          <div className="flex items-center gap-2 font-medium text-accent"><FileText className="h-3.5 w-3.5" />{detail.auditReport.carrierName} — Delegated Authority Audit ({detail.auditReport.period})</div>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 text-ink-soft">
            <li>Triage: {detail.auditReport.triageDecisions}</li>
            <li>Renewal: {detail.auditReport.renewalDecisions}</li>
            <li>Bind: {detail.auditReport.bindDecisions}</li>
            <li>Endorsement: {detail.auditReport.endorsementDecisions}</li>
            <li>Ceiling breaches referred: {detail.auditReport.authorityCeilingBreachesReferred}</li>
            <li>Approved / declined: {detail.auditReport.authorityCeilingBreachesApproved} / {detail.auditReport.authorityCeilingBreachesDeclined}</li>
          </ul>
          <div className="mt-2 text-[11px] text-muted-foreground">{detail.auditReport.groundingStatement}</div>
        </div>
      )}

      {detail.governanceSuggestionQueue.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Governance suggestion queue (AG-07) — human review required</div>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={() => act("approve")} disabled={role === "junior"}><CheckCircle2 className="h-4 w-4" />Mark reviewed</Button>
            {detail.auditReport && <Button variant="secondary" onClick={() => act("send")} disabled={role === "junior"}>Submit to carrier</Button>}
            <Button variant="secondary" onClick={() => act("escalate")}>Escalate to principal</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ============================== #9 Portfolio & Book ============================== */

const PERIODS = { YTD: 1, QTD: 0.28, MTD: 0.09 } as const;
type Period = keyof typeof PERIODS;
const fmtM = (n: number) => `$${n.toFixed(1)}M`;

export function Portfolio() {
  const { role } = useRole();
  const isJunior = role === "junior";
  const [period, setPeriod] = useState<Period>("YTD");
  const [exported, setExported] = useState(false);
  const k = PERIODS[period];
  const { rows: backendRows, details: backendDetails, connected: backendConnected } = useBackendPortfolio(role);

  const boundPremium = 48.2 * k;
  const pif = Math.round(2148 * (0.6 + 0.4 * k));

  // Computed cuts (roadmap: appetite-drift + book-by-line-of-business).
  const driftCount = useMemo(() => renewals.filter((r) => { const dd = getRenewalDetail(r); return !dd.hardRulePassed || dd.recommendation === "NON_RENEW"; }).length, []);
  const byLob = useMemo(() => {
    const m: Record<string, number> = {};
    submissions.forEach((s) => { m[s.lob] = (m[s.lob] ?? 0) + parseMoney(s.premium); });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 08 · Reporting"
        title="Portfolio & Book Performance"
        description="Executive analytics across premium, hit ratio, loss ratio, and retention — aggregated from every workflow, with AI commentary."
        actions={<Button variant="secondary" onClick={() => setExported(true)} disabled={isJunior}><Download className="h-4 w-4" />Export board pack</Button>}
      />

      {isJunior && <SeniorOnlyNote>Portfolio reporting is read-only for junior underwriters — exporting the board pack is a senior/exec action.</SeniorOnlyNote>}

      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {(Object.keys(PERIODS) as Period[]).map((p) => (
          <button key={p} onClick={() => setPeriod(p)} className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition", period === p ? "border-accent/40 bg-accent/10 text-accent" : "border-border bg-secondary hover:border-foreground/30")}>{p}</button>
        ))}
        {exported && <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Board pack exported</Chip>}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi label={`Bound premium ${period}`} value={fmtM(boundPremium)} sub="+14% YoY" to="/app/workflows/bind" />
        <Kpi label="Hit ratio" value="38.4%" sub="+1.7pp" to="/app/workflows/submission-triage" />
        <Kpi label="Loss ratio" value="41.6%" sub="plan 45%" />
        <Kpi label="Renewal retention" value="92%" sub="+3pp" to="/app/workflows/renewal-management" />
        <Kpi label="Appetite drift" value={String(driftCount)} sub="accounts to review" to="/app/workflows/appetite" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title={`Submission pipeline · ${period}`}>
          <div className="flex items-end gap-4 pt-2">
            {monthlyPipeline.map((m) => {
              const max = Math.max(...monthlyPipeline.map((x) => x.subs));
              return (
                <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center gap-1">
                    <div className="w-4 rounded-t bg-foreground/15" style={{ height: `${(m.subs / max) * 100}%` }} title={`Submissions ${m.subs}`} />
                    <div className="w-4 rounded-t bg-accent" style={{ height: `${(m.bound / max) * 100}%` }} title={`Bound ${m.bound}`} />
                  </div>
                  <div className="text-[11px] text-muted-foreground">{m.m}</div>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Premium by state · $M">
          <div className="space-y-2">
            {stateMix.map((s) => {
              const max = Math.max(...stateMix.map((x) => x.premium));
              return (
                <div key={s.state} className="flex items-center gap-3 text-xs">
                  <div className="flex w-10 items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{s.state}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-foreground" style={{ width: `${(s.premium / max) * 100}%` }} /></div>
                  <div className="w-14 text-right font-mono">${(s.premium * k).toFixed(1)}M</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Top brokers">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2 text-left">Broker</th><th className="py-2 text-right">Submissions</th><th className="py-2 text-right">Bound</th><th className="py-2 text-right">Hit</th><th className="py-2 text-right">Premium</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brokers.map((b) => (
                <tr key={b.name} className="hover:bg-secondary/40">
                  <td className="py-2.5 font-medium">{b.name}</td>
                  <td className="py-2.5 text-right">{Math.round(b.submissions * k)}</td>
                  <td className="py-2.5 text-right">{Math.round(b.bound * k)}</td>
                  <td className="py-2.5 text-right font-mono">{b.hit}</td>
                  <td className="py-2.5 text-right font-mono">{b.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Executive AI insight" actions={<Gavel className="h-4 w-4 text-muted-foreground" />}>
          <p className="text-sm">
            {period} bound premium of {fmtM(boundPremium)} is tracking +14% YoY at a {" "}
            <b>41.6% loss ratio</b> (plan 45%), driven by tighter FL warehousing pricing and +3pp renewal retention.
            Marsh Southeast is the strongest growth channel. Watch item: CO contractor loss trend is +6pp above the running mean.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><TrendingUp className="h-3 w-3 text-success" /> Generated from the {period} decision log</div>
        </Panel>
      </div>

      <Panel title="Book by line of business" subtitle="Computed from live submissions · $ premium" className="mt-5">
        <div className="space-y-2">
          {byLob.map(([lob, amt]) => {
            const max = Math.max(...byLob.map((x) => x[1]));
            return (
              <div key={lob} className="flex items-center gap-3 text-xs">
                <div className="w-32 truncate text-muted-foreground">{lob}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-accent" style={{ width: `${(amt / max) * 100}%` }} /></div>
                <div className="w-20 text-right font-mono">${Math.round((amt * k) / 1000)}k</div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Real backend book performance report (backend-connected, PBR-01..PBR-07) */}
      <PortfolioReportPanel
        role={role}
        rows={backendRows}
        details={backendDetails}
        connected={backendConnected}
      />
    </div>
  );
}

/** Real backend portfolio & book performance report (Workflow-08 dataset scenarios) —
 * additive, shown below the illustrative executive analytics demo above rather than
 * replacing it. */
function PortfolioReportPanel({
  role,
  rows,
  details,
  connected,
}: {
  role: "junior" | "senior";
  rows: PortfolioReportRowDTO[] | null;
  details: Record<string, PortfolioReportDetailDTO>;
  connected: boolean;
}) {
  const [sel, setSel] = useState<string | null>(null);
  const list = rows ?? [];
  const selected = sel ?? list[0]?.id ?? null;
  const detail = selected ? details[selected] : undefined;

  if (!connected) {
    return (
      <Panel title="Book performance report" subtitle="Backend-connected · PBR-01..PBR-07" className="mt-5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-[11px] text-muted-foreground">
          <WifiOff className="h-3.5 w-3.5" />
          Backend unavailable — the illustrative executive analytics above still work. A real aggregated book performance report appears here automatically once the Portfolio & Book Performance Reporting service is reachable.
        </div>
      </Panel>
    );
  }

  if (list.length === 0 || !detail) {
    return (
      <Panel title="Book performance report" subtitle="Backend-connected · PBR-01..PBR-07" className="mt-5">
        <div className="text-sm text-muted-foreground">No book performance reports evaluated yet.</div>
      </Panel>
    );
  }

  function act(action: "approve" | "escalate" | "send") {
    if (!selected) return;
    actOnReport(role, selected, action).catch(() => {});
  }

  return (
    <Panel title="Book performance report" subtitle={`Backend-connected · ${detail.period} · PBR-01..PBR-07`} className="mt-5">
      <div className="mb-3 flex flex-wrap gap-2">
        {list.map((r) => (
          <button
            key={r.id}
            onClick={() => setSel(r.id)}
            className={cn("rounded-lg border px-2.5 py-1 text-xs transition", selected === r.id ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40")}
          >
            {r.period}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-3 text-[12px] text-ink-soft">{detail.rationale}</div>

      {detail.dataCompleteness.gaps.length > 0 && (
        <div className="mt-3 rounded-lg border-2 border-warn/40 bg-warn/5 p-3 text-[12px]">
          <div className="flex items-center gap-2 font-medium text-warn"><AlertTriangle className="h-3.5 w-3.5" />Data gap — flagged, never smoothed over (PBR-05)</div>
          <ul className="mt-2 space-y-1 text-ink-soft">
            {detail.dataCompleteness.gaps.map((g, i) => (
              <li key={i}>
                <b>{g.dateRange}:</b> {g.reason}
                {g.crossReferencedFindingId && (
                  <div className="text-[11px] text-muted-foreground">Cross-referenced to {g.crossReferencedFindingId} — not a newly-discovered issue.</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.funnel.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Funnel (PBR-01)</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {detail.funnel.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="rounded-lg border border-border px-2.5 py-1">
                  <span className="font-medium">{f.count}</span> <span className="text-[11px] text-muted-foreground">{f.stage}</span>
                  {f.pctOfPriorStage != null && <span className="ml-1 font-mono text-[11px] text-muted-foreground">({f.pctOfPriorStage.toFixed(1)}%)</span>}
                </div>
                {i < detail.funnel.length - 1 && <ArrowUpRight className="h-3 w-3 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {detail.lossRatio && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Loss ratio (PBR-02, PBR-03)</div>
          <div className={cn("rounded-lg border p-3 text-sm", (detail.lossRatio.lowVolumeFlag || detail.lossRatio.singleEventDrivenFlag) ? "border-warn/40 bg-warn/5" : "border-border")}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{detail.lossRatio.ratioPct.toFixed(1)}%</span>
              <div className="flex gap-1.5">
                {detail.lossRatio.lowVolumeFlag && <Chip tone="warn">low volume</Chip>}
                {detail.lossRatio.singleEventDrivenFlag && <Chip tone="warn">single-event driven</Chip>}
              </div>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">{detail.lossRatio.detail}</div>
          </div>
        </div>
      )}

      {detail.renewalRetention && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Renewal retention (PBR-04) — never collapsed into one bucket</div>
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div className="rounded-lg border border-border p-2.5"><div className="text-[10px] text-muted-foreground">Retained</div><div className="font-mono">{detail.renewalRetention.retained} / {detail.renewalRetention.eligible}</div></div>
            <div className="rounded-lg border border-border p-2.5"><div className="text-[10px] text-muted-foreground">Retention rate</div><div className="font-mono">{detail.renewalRetention.retentionRatePct.toFixed(1)}%</div></div>
            <div className="rounded-lg border border-border p-2.5"><div className="text-[10px] text-muted-foreground">Underwriting non-renewal</div><div className="font-mono">{detail.renewalRetention.nonRenewedUnderwritingDecision}</div></div>
            <div className="rounded-lg border border-warn/30 bg-warn/5 p-2.5"><div className="text-[10px] text-muted-foreground">Lapsed — no decision</div><div className="font-mono">{detail.renewalRetention.lapsedNoDecision}</div></div>
          </div>
          {detail.renewalRetention.lineItems.length > 0 && (
            <ul className="mt-2 divide-y divide-border text-[12px]">
              {detail.renewalRetention.lineItems.map((li, i) => (
                <li key={i} className="flex items-center justify-between gap-2 py-1.5">
                  <span>{li.policyNumber}</span>
                  <Chip tone={li.category === "RETAINED" ? "success" : li.category === "LAPSED_NO_DECISION" ? "warn" : "neutral"}>{li.category.replace(/_/g, " ")}</Chip>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {detail.brokerProduction.length > 0 && (
        <div className="mt-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Broker production (PBR-06) — facts only, no speculation</div>
          <ul className="divide-y divide-border">
            {detail.brokerProduction.map((b, i) => (
              <li key={i} className="py-2.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{b.brokerAgency}</span>
                  <Chip tone={b.significantDecline ? "warn" : "neutral"}>{b.pctChange.toFixed(1)}%</Chip>
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{b.detail}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail.appetiteExposureSection && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-[12px]">
          <div className="flex items-center gap-2 font-medium text-accent"><ShieldAlert className="h-3.5 w-3.5" />Portfolio risk concentration (PBR-07) — pulled from {detail.appetiteExposureSection.pulledFrom}, not recomputed</div>
          <div className="mt-2 text-ink-soft">{detail.appetiteExposureSection.summary}</div>
          {detail.appetiteExposureSection.lowVolumeFlag && <div className="mt-1"><Chip tone="neutral">low volume</Chip></div>}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
        <Button variant="primary" onClick={() => act("approve")} disabled={role === "junior"}><CheckCircle2 className="h-4 w-4" />Mark reviewed</Button>
        <Button variant="secondary" onClick={() => act("send")} disabled={role === "junior"}>Send to principal</Button>
        <Button variant="secondary" onClick={() => act("escalate")}>Escalate</Button>
      </div>
    </Panel>
  );
}
