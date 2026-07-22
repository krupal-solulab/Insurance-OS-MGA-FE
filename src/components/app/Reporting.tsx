import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { Download, Gavel, ShieldAlert, CheckCircle2, Search, Filter, ArrowUpRight, TrendingUp, MapPin } from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole, SeniorOnlyNote, parseMoney } from "./role";
import { useDecisions } from "./decisions";
import { brokers, monthlyPipeline, stateMix, submissions, renewals, getRenewalDetail, type ActivityEntry } from "./mocks";

/* ============================================================
   Governance & Portfolio reporting — clickable, no backend.
   Seeded from the mock decision log + computed rollups over the
   existing mock arrays. Backend later = query the audit log.
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
    </div>
  );
}
