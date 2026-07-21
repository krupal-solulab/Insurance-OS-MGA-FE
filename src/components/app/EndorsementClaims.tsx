import { useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, ShieldAlert, Send, Siren } from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole } from "./role";
import { endorsements, claims, nowClock, type ActivityEntry } from "./mocks";

/* Endorsement (#6, MGA framing) + Claims (#10, preview) — minimal
   clickable prototypes, no backend, role-gated where it matters. */

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
function List({ items, sel, onSel, render }: { items: any[]; sel: string; onSel: (id: string) => void; render: (x: any) => ReactNode }) {
  return (
    <ul className="divide-y divide-border">
      {items.map((x) => (
        <button key={x.id} onClick={() => onSel(x.id)} className={cn("w-full py-3 text-left transition", sel === x.id ? "bg-secondary/50" : "hover:bg-secondary/30")}>{render(x)}</button>
      ))}
    </ul>
  );
}
function ActivityList({ items }: { items: ActivityEntry[] }) {
  return (
    <ul className="divide-y divide-border">
      {[...items].reverse().map((a, i) => (
        <li key={i} className="flex items-start gap-3 py-2.5 text-sm"><span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{a.at}</span><div className="flex-1"><div><b>{a.who}</b> — {a.what}</div>{a.ctx && <div className="text-[11px] text-muted-foreground">{a.ctx}</div>}</div></li>
      ))}
    </ul>
  );
}

/* ------------------------------ #6 Endorsements ------------------------------ */

const isMaterial = (type: string) => /location|limit|class|operations/i.test(type);

export function Endorsements() {
  const { role } = useRole();
  const isJunior = role === "junior";
  const [sel, setSel] = useState(endorsements[0].id);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const e = endorsements.find((x) => x.id === sel)!;
  const material = isMaterial(e.type);
  const canApprove = !isJunior || !material; // material changes → senior
  const done = decisions[sel];

  function log(entry: Omit<ActivityEntry, "at">) { setActivity((a) => [...a, { at: nowClock(), ...entry }]); }
  function act(label: string, who: string, ctx: string) { setDecisions((d) => ({ ...d, [sel]: label })); log({ who, what: label, ctx }); }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader eyebrow="Workflow 04" title="Endorsement Processing" description="Read the change request, diff it against the in-force policy, check appetite & premium impact, and draft the endorsement — human-approved." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="Open endorsement requests">
          <List items={endorsements} sel={sel} onSel={(id) => setSel(id)} render={(r) => (
            <>
              <div className="flex items-center justify-between text-sm"><span className="font-medium">{r.insured}</span><span className="text-[11px] text-muted-foreground">{r.requested}</span></div>
              <div className="text-[11px] text-muted-foreground">{r.id} · {r.policy}</div>
              <div className="mt-1 flex items-center gap-2"><Chip tone={isMaterial(r.type) ? "warn" : "accent"}>{r.type}</Chip><span className="text-xs">{r.impact}</span>{decisions[r.id] && <Chip tone="success">✓</Chip>}</div>
            </>
          )} />
        </Panel>

        <div className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] text-muted-foreground">{e.id} · Policy {e.policy}</div>
                <h2 className="mt-1 font-serif text-2xl">{e.insured}</h2>
                <div className="mt-1 text-xs text-muted-foreground">Requested change: {e.type} · {e.impact}</div>
              </div>
              {done ? <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> {done}</Chip> : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => act("Returned to broker", "Priya R. (UW)", e.id)}>Return to broker</Button>
                  {canApprove
                    ? <Button variant="primary" onClick={() => act("Approved · endorsement issued", "Priya R. (UW)", `${e.type} · ${e.impact}`)}>Approve · issue</Button>
                    : <Button variant="primary" onClick={() => act("Sent to senior for approval", "Sofia A. (Jr UW)", "material change")}>Send to senior <Send className="h-3.5 w-3.5" /></Button>}
                </div>
              )}
            </div>
            {isJunior && material && !done && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"><ShieldAlert className="h-3.5 w-3.5 text-accent" />Material changes (limit/location/class) are approved by a senior.</div>
            )}
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Difference engine · before → after">
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border text-sm">
                {["Change", "In-force", "After"].map((h) => <div key={h} className="bg-secondary/60 px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{h}</div>)}
                {[["Requested", "—", e.type], ["Premium", "current", e.impact]].map((r) => (
                  <>
                    <div className="border-t border-border px-3 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">{r[0]}</div>
                    <div className="border-t border-border px-3 py-2">{r[1]}</div>
                    <div className="border-t border-border px-3 py-2">{r[2]}</div>
                  </>
                ))}
              </div>
            </Panel>
            <Panel title="Appetite & premium impact">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Within permitted state / class</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />TIV under $250M cap</li>
                <li className="flex items-center gap-2">{material ? <AlertTriangle className="h-4 w-4 text-warn" /> : <CheckCircle2 className="h-4 w-4 text-success" />}{material ? "Material — underwriting review" : "Routine — no appetite impact"}</li>
              </ul>
            </Panel>
          </div>

          {activity.length > 0 && <Panel title="Activity"><ActivityList items={activity} /></Panel>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ #10 Claims (preview) ------------------------------ */

export function Claims() {
  const [sel, setSel] = useState(claims[0].id);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const c = claims.find((x) => x.id === sel)!;

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader eyebrow="Workflow 10 · Preview" title="Claims Intake Coordination" description="FNOL intake → severity prediction → route to carrier/TPA. Preview of a roadmap workflow." />
      <div className="mb-4 rounded-xl border border-border bg-secondary/50 p-3 text-[12px] text-muted-foreground">Preview — this workflow is on the roadmap (for MGAs with delegated claims authority) and is illustrative only.</div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="Recent FNOLs">
          <List items={claims} sel={sel} onSel={(id) => setSel(id)} render={(r) => (
            <>
              <div className="flex items-center justify-between text-sm"><span className="font-medium">{r.insured}</span><span className="text-[11px] text-muted-foreground">{r.reported}</span></div>
              <div className="text-[11px] text-muted-foreground">{r.id} · {r.type}</div>
              <div className="mt-1 flex items-center gap-2"><Chip tone={r.severity === "High" ? "danger" : r.severity === "Medium" ? "warn" : "success"}>{r.severity}</Chip><span className="font-mono text-xs">{r.reserve}</span>{sent[r.id] && <Chip tone="success">Sent to TPA</Chip>}</div>
            </>
          )} />
        </Panel>

        <div className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-[11px] text-muted-foreground">{c.id}</div>
                <h2 className="mt-1 font-serif text-2xl">{c.insured}</h2>
                <div className="mt-1 text-xs text-muted-foreground">{c.type} · reported {c.reported} · reserve {c.reserve}</div>
              </div>
              {sent[c.id] ? <Chip tone="success"><CheckCircle2 className="h-3 w-3" /> Routed to {c.tpa}</Chip> : (
                <Button variant="primary" onClick={() => { setSent((s) => ({ ...s, [c.id]: true })); setActivity((a) => [...a, { at: nowClock(), who: "Priya R. (UW)", what: `Routed to ${c.tpa}`, ctx: c.id }]); }}><Siren className="h-4 w-4" />Send to TPA</Button>
              )}
            </div>
          </Panel>
          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Severity prediction">
              <div className={cn("rounded-xl border p-4", c.severity === "High" ? "border-destructive/40 bg-destructive/5" : c.severity === "Medium" ? "border-warn/40 bg-warn/5" : "border-success/40 bg-success/5")}>
                <div className="flex items-center gap-2"><AlertTriangle className={cn("h-5 w-5", c.severity === "High" ? "text-destructive" : c.severity === "Medium" ? "text-warn" : "text-success")} /><div className="font-serif text-xl">{c.severity}</div><Chip tone="neutral">88% conf.</Chip></div>
                <p className="mt-2 text-sm">Suggested reserve <b>{c.reserve}</b>, based on comparable prior losses.</p>
              </div>
            </Panel>
            <Panel title="Routing">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Assigned carrier</span><Chip tone="accent">Carrier A</Chip></li>
                <li className="flex justify-between"><span>Assigned TPA</span><Chip>{c.tpa}</Chip></li>
                <li className="flex justify-between"><span>SLA</span><span>24h contact</span></li>
              </ul>
            </Panel>
          </div>
          {activity.length > 0 && <Panel title="Activity"><ActivityList items={activity} /></Panel>}
        </div>
      </div>
    </div>
  );
}
