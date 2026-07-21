import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { CheckCircle2, Circle, ShieldCheck, ShieldAlert, FileCheck2, Send, Gavel } from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole } from "./role";
import { getBindOrder, nowClock, type BindOrder as BindOrderT, type ActivityEntry } from "./mocks";

/* ============================================================
   Bind Order & Issuance — clickable prototype, no backend.
   Subjectivities/compliance gate readiness; "Issue policy"
   simulates PAS write-back. Highest-stakes → senior approval.
   ============================================================ */

function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warn" | "danger" | "accent" }) {
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
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...p}>{children}</button>;
}

export function BindOrder() {
  const [bo, setBo] = useState<BindOrderT>(() => getBindOrder());
  const [issued, setIssued] = useState<null | "issued" | "escalated">(null);
  const [activity, setActivity] = useState<ActivityEntry[]>(() => getBindOrder().activity);
  const { role } = useRole();
  const isJunior = role === "junior";

  const cleared = bo.checks.filter((c) => c.cleared).length;
  const ready = cleared === bo.checks.length;

  function log(entry: Omit<ActivityEntry, "at">) {
    setActivity((a) => [...a, { at: nowClock(), ...entry }]);
  }
  function toggle(id: string) {
    setBo((prev) => {
      const checks = prev.checks.map((c) => (c.id === id ? { ...c, cleared: !c.cleared } : c));
      const c = checks.find((x) => x.id === id)!;
      log({ who: "Priya R. (UW)", what: `${c.cleared ? "Cleared" : "Reopened"} — ${c.label}` });
      // keep packet's surplus-lines/PAS in sync with compliance + readiness
      const allClear = checks.every((x) => x.cleared);
      const packet = prev.packet.map((p) =>
        p.label === "Surplus-lines filing" ? { ...p, ready: checks.find((x) => x.id === "comp-sl")!.cleared } : p.label === "PAS write-back" ? { ...p, ready: allClear && issued === "issued" } : p,
      );
      return { ...prev, checks, packet };
    });
  }
  function issue() {
    if (!ready) return;
    setIssued("issued");
    setBo((prev) => ({ ...prev, packet: prev.packet.map((p) => ({ ...p, ready: true })) }));
    log({ who: "Priya R. (UW)", what: "Issued policy · wrote back to PAS", ctx: `${bo.insured} · ${bo.premium}` });
  }
  function escalate() {
    setIssued("escalated");
    log({ who: "Sofia A. (Jr UW)", what: "Sent bind to senior for issuance", ctx: "issuance is a senior action" });
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 06"
        title="Bind Order & Policy Issuance"
        description="From approved submission to bound policy — subjectivities, compliance, and issuance in one workflow. Nothing issues until every condition clears and a human approves."
        actions={<span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground"><span className="inline-block h-1 w-1 rounded-full bg-accent/70" /> Illustrative</span>}
      />

      {/* Overall status */}
      <div className={cn("mb-5 flex items-start gap-3 rounded-xl border-2 p-4", issued === "issued" ? "border-success/40 bg-success/5" : ready ? "border-success/40 bg-success/5" : "border-warn/40 bg-warn/5")}>
        {issued === "issued" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : ready ? <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" /> : <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-warn" />}
        <div>
          <div className={cn("font-serif text-lg", issued === "issued" ? "text-success" : ready ? "text-success" : "text-warn")}>
            {issued === "issued" ? "Policy issued · written to PAS" : ready ? "Ready to bind" : `Blocked — ${bo.checks.length - cleared} condition(s) outstanding`}
          </div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            {bo.insured} · {bo.premium} · effective {bo.effective}. {cleared}/{bo.checks.length} conditions cleared.
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Checklist */}
        <Panel title="Bind conditions" subtitle="Subjectivities & compliance — click to clear" actions={<FoundationBadge />}>
          <ul className="space-y-2">
            {bo.checks.map((c) => (
              <li key={c.id} className={cn("flex items-start gap-3 rounded-lg border p-3", c.cleared ? "border-border" : "border-warn/40 bg-warn/5")}>
                <button onClick={() => !issued && toggle(c.id)} disabled={!!issued} className="mt-0.5 shrink-0" aria-label="toggle">
                  {c.cleared ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-medium">{c.label}<Chip tone={c.kind === "compliance" ? "accent" : "neutral"}>{c.kind}</Chip></div>
                  <div className="text-[11px] text-muted-foreground">{c.note}</div>
                </div>
                <Chip tone={c.cleared ? "success" : "warn"}>{c.cleared ? "Cleared" : "Pending"}</Chip>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          {/* AI bind recommendation */}
          <Panel title="AI bind recommendation">
            <div className={cn("rounded-xl border-2 p-4", ready ? "border-success/40 bg-success/5" : "border-warn/40 bg-warn/5")}>
              <div className="flex items-center gap-2">
                {ready ? <CheckCircle2 className="h-5 w-5 text-success" /> : <ShieldAlert className="h-5 w-5 text-warn" />}
                <div className="font-serif text-lg">{ready ? "Ready to bind" : "Hold — conditions open"}</div>
              </div>
              <p className="mt-2 text-sm">
                {ready
                  ? `All ${bo.checks.length} conditions satisfied. Premium ${bo.premium}, effective ${bo.effective}. Recommend issuing the binder to hold rate.`
                  : `${bo.checks.length - cleared} condition(s) outstanding: ${bo.checks.filter((c) => !c.cleared).map((c) => c.label).join(", ")}.`}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              {issued ? (
                <Chip tone={issued === "issued" ? "success" : "accent"}><CheckCircle2 className="h-3 w-3" /> {issued === "issued" ? "Policy issued" : "Sent to senior"}</Chip>
              ) : isJunior ? (
                <>
                  <Button variant="primary" className="w-full" onClick={escalate} disabled={!ready}><Send className="h-4 w-4" />Send to senior to issue</Button>
                  <div className="rounded-lg border border-border bg-secondary/40 p-2.5 text-[11px] text-muted-foreground">
                    <ShieldAlert className="mr-1 inline h-3.5 w-3.5 text-accent" />Policy issuance is a senior-underwriter action.
                  </div>
                </>
              ) : (
                <Button variant="primary" className="w-full" onClick={issue} disabled={!ready} title={ready ? "Issue policy & write back to PAS" : "Clear all conditions first"}>
                  <FileCheck2 className="h-4 w-4" />Issue policy · write to PAS
                </Button>
              )}
            </div>
          </Panel>

          {/* Issuance packet */}
          <Panel title="Issuance packet">
            <ul className="space-y-2 text-sm">
              {bo.packet.map((p) => (
                <li key={p.label} className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2">
                    {p.ready ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    {p.label}
                  </span>
                  <Chip tone={p.ready ? "success" : "neutral"}>{p.ready ? "Ready" : "Pending"}</Chip>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Activity */}
      <Panel title="Activity" subtitle="Conditions · issuance — audited" className="mt-5">
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
  );
}

function FoundationBadge() {
  return (
    <Link to="/app/foundation/decision-core" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-foreground/40">
      <Gavel className="h-3 w-3 text-accent" /> Decision Core
    </Link>
  );
}
