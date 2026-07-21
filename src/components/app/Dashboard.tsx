import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Upload,
  RefreshCcw,
  FileSpreadsheet,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Inbox,
  FileEdit,
  Calculator,
  FileCheck2,
  Siren,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { PageHeader } from "./AppShell";
import { decisionsLog, monthlyPipeline, stateMix, submissions, renewals, claims } from "./mocks";
import type { ReactNode } from "react";

export function Dashboard() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        eyebrow="Monday · January 12, 2026"
        title="Good morning, Priya."
        description="Everything Coverline handled overnight, and what needs a human today."
        actions={
          <>
            <QuickAction icon={Upload} label="Upload submission" to="/app/workflows/submission-triage" />
            <QuickAction icon={RefreshCcw} label="Start renewal review" to="/app/workflows/renewal-management" />
            <QuickAction icon={FileSpreadsheet} label="Generate bordereau" to="/app/workflows/bordereau" />
            <QuickAction icon={Sparkles} label="Open AI Assistant" to="/app/assistant" primary />
          </>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Today's submissions" value="24" delta="+18%" trend="up" sub="vs. 7-day avg" to="/app/workflows/submission-triage" />
        <Kpi label="Renewals pending" value="7" delta="2 due this week" trend="warn" to="/app/workflows/renewal-management" />
        <Kpi label="Endorsements waiting" value="4" delta="Median 6h" trend="neutral" to="/app/workflows/endorsements" />
        <Kpi label="Quotes generated" value="18" delta="+3 vs yesterday" trend="up" to="/app/workflows/quoting" />
        <Kpi label="Policies bound" value="6" delta="$1.42M premium" trend="up" to="/app/workflows/bind" />
        <Kpi label="Broker response time" value="1h 42m" delta="−22m vs Q4" trend="up" to="/app/workflows/broker-copilot" />
        <Kpi label="Bound premium (MTD)" value="$4.86M" delta="Plan 96%" trend="up" to="/app/workflows/portfolio" />
        <Kpi label="Hit ratio" value="38.4%" delta="+1.7pp" trend="up" to="/app/workflows/portfolio" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Pipeline chart */}
        <Card className="lg:col-span-2" title="Submission pipeline" subtitle="Submissions received vs. bound — trailing 7 months" href="/app/workflows/portfolio">
          <PipelineChart />
        </Card>

        {/* AI insights */}
        <Card title="AI insights" subtitle="From Decision Core · updated 2 min ago" href="/app/assistant">
          <ul className="space-y-4 text-sm">
            <Insight
              tone="accent"
              title="Rate adequacy drifting on FL warehousing"
              body="Loss ratio on FL cold-storage risks is trending 8pp above plan. Consider tightening deductibles on new business."
            />
            <Insight
              tone="warn"
              title="3 submissions stalled > 48h"
              body="Missing SOV or loss run. Draft a chase email from Broker Copilot."
            />
            <Insight
              tone="success"
              title="Marsh Southeast momentum"
              body="+22% submissions QoQ, hit ratio stable at 42%. Prioritize their inbox today."
            />
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Submissions */}
        <Card className="lg:col-span-2" title="Today's submissions" subtitle="Auto-triaged by Extraction Core + Decision Core" href="/app/workflows/submission-triage">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <Th>Insured</Th>
                  <Th>Broker</Th>
                  <Th>State</Th>
                  <Th>Premium</Th>
                  <Th>Score</Th>
                  <Th>Recommendation</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {submissions.slice(0, 6).map((s) => (
                  <tr key={s.id} className="cursor-pointer transition hover:bg-secondary/40">
                    <Td>
                      <Link to="/app/workflows/submission-triage" className="font-medium text-foreground hover:text-accent">
                        {s.insured}
                      </Link>
                      <div className="text-[11px] text-muted-foreground">
                        {s.id} · {s.lob}
                      </div>
                    </Td>
                    <Td>
                      <div className="text-foreground">{s.broker}</div>
                      <div className="text-[11px] text-muted-foreground">{s.brokerage}</div>
                    </Td>
                    <Td>{s.state}</Td>
                    <Td className="font-mono text-xs">{s.premium}</Td>
                    <Td>
                      <ScorePill value={s.score} />
                    </Td>
                    <Td>
                      <RecPill rec={s.recommendation} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Portfolio map */}
        <Card title="Portfolio by state" subtitle="Bound premium, $M — YTD" href="/app/workflows/portfolio">
          <StateMap />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Renewals */}
        <Card title="Renewal pipeline" subtitle="Next 60 days" href="/app/workflows/renewal-management">
          <ul className="divide-y divide-border text-sm">
            {renewals.slice(0, 4).map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.insured}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Expires {r.expiring} · {r.flag}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs">{r.indicated}</div>
                    <div className="text-[11px] text-accent">{r.change}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Recent AI decisions */}
        <Card title="Recent AI decisions" subtitle="Every action is logged & auditable" href="/app/workflows/appetite">
          <ul className="space-y-3 text-sm">
            {decisionsLog.map((d, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1 font-mono text-[10px] text-muted-foreground">{d.at}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate">
                    <b>{d.who}</b> — {d.what}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground">{d.ctx}</div>
                </div>
                {d.conf !== "—" && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono">{d.conf}</span>
                )}
              </li>
            ))}
          </ul>
        </Card>

        {/* Claims + Bordereau */}
        <Card title="Alerts & deadlines" href="/app/workflows/bordereau">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
              <div>
                <div className="font-medium">Bordereau — Carrier A</div>
                <div className="text-[11px] text-muted-foreground">Due Jan 15 · monthly premium bordereau · 214 policies</div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-lg border border-border p-3">
              <Siren className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <div className="font-medium">2 claims opened this AM</div>
                <div className="text-[11px] text-muted-foreground">
                  {claims[0].insured} · {claims[0].type} — reserve {claims[0].reserve}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3 rounded-lg border border-border p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <div>
                <div className="font-medium">Appetite audit ready</div>
                <div className="text-[11px] text-muted-foreground">Q4 override report signed off · 0 exceptions</div>
              </div>
            </li>
          </ul>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <WorkflowTile to="/app/workflows/submission-triage" icon={Inbox} title="Submission Triage" count="12 in queue" />
        <WorkflowTile to="/app/workflows/renewal-management" icon={RefreshCcw} title="Renewals" count="7 pending" />
        <WorkflowTile to="/app/workflows/endorsements" icon={FileEdit} title="Endorsements" count="4 open" />
        <WorkflowTile to="/app/workflows/quoting" icon={Calculator} title="Quoting" count="18 today" />
        <WorkflowTile to="/app/workflows/bind" icon={FileCheck2} title="Bind orders" count="3 ready" />
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  to,
  primary,
}: {
  icon: any;
  label: string;
  to: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={
        primary
          ? "inline-flex items-center gap-2 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background transition hover:opacity-90"
          : "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground transition hover:bg-secondary"
      }
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function Kpi({
  label,
  value,
  delta,
  trend,
  sub,
  to,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "warn" | "neutral";
  sub?: string;
  to: string;
}) {
  const trendCls =
    trend === "up"
      ? "text-success"
      : trend === "down"
      ? "text-destructive"
      : trend === "warn"
      ? "text-warn"
      : "text-muted-foreground";
  const Arrow = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : trend === "warn" ? Clock : Info;
  return (
    <Link
      to={to}
      className="group rounded-xl border border-border bg-background p-4 transition hover:border-foreground/40 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
      </div>
      <div className="mt-3 font-serif text-3xl leading-none tracking-tight">{value}</div>
      <div className={`mt-2 flex items-center gap-1 text-[11px] ${trendCls}`}>
        <Arrow className="h-3 w-3" /> {delta}
      </div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground">{sub}</div>}
    </Link>
  );
}

function Card({
  title,
  subtitle,
  href,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-border bg-background p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg leading-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {href && (
          <Link to={href} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Open <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-3 align-top ${className}`}>{children}</td>;
}

function ScorePill({ value }: { value: number }) {
  if (value === 0) return <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-mono">…</span>;
  const tone =
    value >= 80 ? "bg-success/10 text-success" : value >= 60 ? "bg-warn/15 text-warn" : "bg-destructive/10 text-destructive";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${tone}`}>{value}</span>;
}

function RecPill({ rec }: { rec: string }) {
  const tone =
    rec === "Proceed"
      ? "border-success/30 bg-success/10 text-success"
      : rec === "Decline"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : "border-warn/30 bg-warn/10 text-warn";
  const Icon = rec === "Proceed" ? CheckCircle2 : rec === "Decline" ? AlertTriangle : Info;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${tone}`}>
      <Icon className="h-3 w-3" /> {rec}
    </span>
  );
}

function Insight({ tone, title, body }: { tone: "accent" | "warn" | "success"; title: string; body: string }) {
  const bar =
    tone === "accent" ? "bg-accent" : tone === "warn" ? "bg-warn" : "bg-success";
  return (
    <li className="flex gap-3">
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${bar}`} />
      <div>
        <div className="font-medium leading-tight">{title}</div>
        <div className="mt-1 text-[12px] text-muted-foreground">{body}</div>
      </div>
    </li>
  );
}

function PipelineChart() {
  const max = Math.max(...monthlyPipeline.map((m) => m.subs));
  return (
    <div>
      <div className="flex items-end gap-4 pt-2">
        {monthlyPipeline.map((m) => (
          <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-40 w-full items-end justify-center gap-1">
              <div
                className="w-4 rounded-t bg-foreground/15"
                style={{ height: `${(m.subs / max) * 100}%` }}
                title={`Submissions ${m.subs}`}
              />
              <div
                className="w-4 rounded-t bg-accent"
                style={{ height: `${(m.bound / max) * 100}%` }}
                title={`Bound ${m.bound}`}
              />
            </div>
            <div className="text-[11px] text-muted-foreground">{m.m}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-foreground/15" /> Submissions</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent" /> Bound</span>
        <span className="ml-auto">Conversion 39.1% · rolling 7mo</span>
      </div>
    </div>
  );
}

function StateMap() {
  const max = Math.max(...stateMix.map((s) => s.premium));
  return (
    <div className="space-y-2">
      {stateMix.map((s) => (
        <div key={s.state} className="flex items-center gap-3 text-xs">
          <div className="flex w-10 items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {s.state}
          </div>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-foreground" style={{ width: `${(s.premium / max) * 100}%` }} />
          </div>
          <div className="w-14 text-right font-mono">${s.premium.toFixed(1)}M</div>
        </div>
      ))}
    </div>
  );
}

function WorkflowTile({ to, icon: Icon, title, count }: { to: string; icon: any; title: string; count: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-4 transition hover:border-foreground/40"
    >
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-secondary group-hover:bg-foreground group-hover:text-background">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{count}</div>
      </div>
      <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
    </Link>
  );
}
