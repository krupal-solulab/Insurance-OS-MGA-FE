import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  Sparkles,
  Filter,
  Search,
  Upload,
  Paperclip,
  Send,
  Building2,
  MapPin,
  Calendar,
  Download,
  ShieldCheck,
  Gavel,
  Scan,
  ChevronDown,
  ChevronRight,
  Clock,
  RefreshCcw,
  MessageSquare,
  FileEdit,
  Calculator,
  FileCheck2,
  BarChart3,
  FileSpreadsheet,
  Siren,
  MoreHorizontal,
  Play,
  Pause,
} from "lucide-react";
import { PageHeader } from "./AppShell";
import { appetiteRules, brokers, claims, decisionsLog, endorsements, monthlyPipeline, renewals, stateMix, submissionDocs, submissions } from "./mocks";
import type { ReactNode } from "react";

/* ============================================================
   Reusable primitives shared across every workflow
   ============================================================ */

export function Panel({ title, subtitle, actions, children, className = "" }: { title?: string; subtitle?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-background p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h3 className="font-serif text-lg leading-tight">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

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
  const base = "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition";
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

function SearchBar({ placeholder = "Search…" }: { placeholder?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
      <Search className="h-3.5 w-3.5 text-muted-foreground" />
      <input placeholder={placeholder} className="flex-1 bg-transparent outline-none" />
    </div>
  );
}

function FiltersRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
      {items.map((i, idx) => (
        <Chip key={i} tone={idx === 0 ? "accent" : "neutral"}>
          {i}
        </Chip>
      ))}
    </div>
  );
}

function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-secondary/60 p-1 text-xs">
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

function ProcessAnim({ steps }: { steps: { label: string; kind?: "extraction" | "decision" }[] }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3 text-accent" /> Live AI processing
      </div>
      <ol className="space-y-2 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-background text-[11px] font-mono">{i + 1}</span>
            <span className="flex-1">{s.label}</span>
            {s.kind && <FoundationBadge kind={s.kind} />}
            <CheckCircle2 className="h-4 w-4 text-success" />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ============================================================
   1. Submission Triage
   ============================================================ */

export function SubmissionTriage() {
  const [selected, setSelected] = useState<string>(submissions[0].id);
  const s = submissions.find((x) => x.id === selected)!;
  const [tab, setTab] = useState("Documents");
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 01"
        title="Submission Triage"
        description="Email → extraction → risk analysis → appetite check → recommendation. Every submission, every time."
        actions={
          <>
            <Button variant="secondary"><Upload className="h-4 w-4" />Upload submission</Button>
            <Button variant="primary"><Sparkles className="h-4 w-4" />Run batch triage</Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FiltersRow items={["All open", "In appetite", "Marginal", "Needs info", "Declined"]} />
        <div className="w-72"><SearchBar placeholder="Search by insured, broker, id…" /></div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]">
        {/* Inbox */}
        <Panel title="Submission inbox" subtitle="24 today · 12 awaiting review">
          <div className="divide-y divide-border">
            {submissions.map((row) => (
              <button
                key={row.id}
                onClick={() => setSelected(row.id)}
                className={`flex w-full items-start gap-3 py-3 text-left transition hover:bg-secondary/40 ${
                  selected === row.id ? "bg-secondary/50" : ""
                }`}
              >
                <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${row.status === "New" || row.status === "Extracting" ? "bg-accent" : "bg-transparent"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{row.insured}</span>
                    <span className="text-[11px] text-muted-foreground">{row.received}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{row.brokerage}</span>·<span>{row.state}</span>·<span className="font-mono">{row.premium}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Chip tone={row.appetite === "In appetite" ? "success" : row.appetite === "Marginal" ? "warn" : "danger"}>{row.appetite}</Chip>
                    <Chip>{row.status}</Chip>
                    {row.score > 0 && <Chip tone={row.score >= 80 ? "success" : row.score >= 60 ? "warn" : "danger"}>Score {row.score}</Chip>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        {/* Detail */}
        <div className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-muted-foreground">{s.id}</div>
                <h2 className="mt-1 font-serif text-2xl leading-tight">{s.insured}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{s.industry}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.state}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />Effective {s.effective}</span>
                  <span>TIV {s.tiv}</span>
                  <span>Est. premium {s.premium}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary">Request info</Button>
                <Button variant="danger">Decline</Button>
                <Button variant="primary">Proceed to quote <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <MetricTile label="Risk score" value={s.score.toString()} sub="Decision Core · 94% conf." tone={s.score >= 80 ? "success" : "warn"} />
              <MetricTile label="Appetite" value={s.appetite} sub="5 of 6 rules pass" tone={s.appetite === "In appetite" ? "success" : "warn"} />
              <MetricTile label="Recommendation" value={s.recommendation} sub="AI + underwriter co-sign" tone={s.recommendation === "Proceed" ? "success" : s.recommendation === "Decline" ? "danger" : "warn"} />
            </div>
          </Panel>

          <ProcessAnim
            steps={[
              { label: "Email ingested from broker (Marsh Southeast)", kind: "extraction" },
              { label: "6 attachments classified · 291 fields extracted", kind: "extraction" },
              { label: "ACORD 125 / 140 parsed · loss run reconciled", kind: "extraction" },
              { label: "Cross-document validation passed (0 conflicts)", kind: "extraction" },
              { label: "Appetite rules evaluated · 5/6 pass", kind: "decision" },
              { label: "Risk score computed · recommendation drafted", kind: "decision" },
            ]}
          />

          <Panel>
            <Tabs tabs={["Documents", "Risk analysis", "Appetite check", "AI recommendation", "Activity"]} value={tab} onChange={setTab} />
            <div className="mt-5">
              {tab === "Documents" && <DocumentsTab />}
              {tab === "Risk analysis" && <RiskTab />}
              {tab === "Appetite check" && <AppetiteTab />}
              {tab === "AI recommendation" && <RecommendationTab />}
              {tab === "Activity" && <ActivityTab />}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "success" | "warn" | "danger" }) {
  const border =
    tone === "success" ? "border-success/30" : tone === "warn" ? "border-warn/30" : "border-destructive/30";
  return (
    <div className={`rounded-xl border ${border} bg-secondary/30 p-4`}>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-2xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function DocumentsTab() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">6 documents · 291 fields extracted</div>
          <FoundationBadge kind="extraction" />
        </div>
        <ul className="space-y-2 text-sm">
          {submissionDocs.map((d) => (
            <li key={d.name} className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary"><FileText className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{d.name}</div>
                <div className="text-[11px] text-muted-foreground">{d.kind} · {d.pages}p · {d.extractedFields} fields</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-mono ${d.confidence > 0.95 ? "text-success" : d.confidence > 0.9 ? "text-warn" : "text-destructive"}`}>{(d.confidence * 100).toFixed(0)}%</div>
                <div className="text-[10px] text-muted-foreground">confidence</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="mb-2 text-xs font-medium">Document viewer · ACORD_125_Palmetto.pdf</div>
        <div className="relative overflow-hidden rounded-lg border border-border bg-paper">
          <div className="grid grid-cols-2 gap-6 p-6 font-mono text-[11px] text-ink-soft">
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Named Insured</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">Palmetto Cold Storage LLC</div>
              <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">FEIN</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">58-1298347</div>
              <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Mailing address</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">4210 Warehouse Rd, Jacksonville FL 32218</div>
              <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Business type</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">Cold storage warehousing (NAICS 493120)</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Effective / Expiration</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">02/12/2026 – 02/12/2027</div>
              <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Prior carrier</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">Great American</div>
              <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Prior premium</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">$168,900</div>
              <div className="mt-3 mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">Annual revenue</div>
              <div className="rounded bg-accent/15 px-1 py-0.5 text-foreground">$41,200,000</div>
            </div>
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent">
            42 fields highlighted
          </div>
        </div>
        <div className="mt-2 text-[10px] text-muted-foreground">Every highlighted field is a citation — click to jump to the source page.</div>
      </div>
    </div>
  );
}

function RiskTab() {
  const factors = [
    { name: "Loss history (5yr)", value: "38% loss ratio", weight: "+18" },
    { name: "Sprinklered TIV", value: "92%", weight: "+12" },
    { name: "Cold-storage class", value: "Elevated freeze/mech loss", weight: "-9" },
    { name: "Coastal FL flood zone", value: "Zone X · non-SFHA", weight: "+6" },
    { name: "Revenue stability", value: "3yr CAGR +11%", weight: "+8" },
    { name: "Open flood claim", value: "$180k reserve", weight: "-4" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">Risk factor breakdown</div>
          <FoundationBadge kind="decision" />
        </div>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {factors.map((f) => (
            <li key={f.name} className="flex items-center justify-between p-3 text-sm">
              <div>
                <div className="font-medium">{f.name}</div>
                <div className="text-[11px] text-muted-foreground">{f.value}</div>
              </div>
              <span className={`font-mono text-xs ${f.weight.startsWith("+") ? "text-success" : "text-destructive"}`}>{f.weight}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="mb-2 text-xs font-medium">Cross-document consistency</div>
        <div className="space-y-2 text-sm">
          <Consistency label="Revenue: ACORD 125 vs. Financials" ok detail="$41.2M matches audited P&L" />
          <Consistency label="TIV: ACORD 140 vs. SOV" ok detail="$42.8M reconciles across 14 locations" />
          <Consistency label="Loss run: 5yr paid vs. incurred" ok detail="Consistent with prior carrier report" />
          <Consistency label="Address: cover email vs. ACORD" ok detail="Jacksonville FL — matches" />
          <Consistency label="Sprinklered %: SOV vs. inspection" warn detail="SOV says 92%, prior inspection said 88% — reviewer suggested" />
        </div>
      </div>
    </div>
  );
}

function Consistency({ label, detail, ok, warn }: { label: string; detail: string; ok?: boolean; warn?: boolean }) {
  const Icon = warn ? AlertTriangle : ok ? CheckCircle2 : Info;
  const tone = warn ? "text-warn" : ok ? "text-success" : "text-muted-foreground";
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone}`} />
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function AppetiteTab() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-medium">Appetite evaluation · 5 of 6 rules pass</div>
        <FoundationBadge kind="decision" />
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {appetiteRules.map((r) => (
          <li key={r.rule} className="flex items-start gap-3 p-3 text-sm">
            {r.pass ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />}
            <div className="flex-1">
              <div className="font-medium">{r.rule}</div>
              <div className="text-[11px] text-muted-foreground">{r.detail}</div>
            </div>
            <Chip tone={r.pass ? "success" : "warn"}>{r.pass ? "Pass" : "Review"}</Chip>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecommendationTab() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border-2 border-success/40 bg-success/5 p-4 md:col-span-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div className="font-serif text-xl">Proceed to quote</div>
          <Chip tone="success">94% confidence</Chip>
        </div>
        <p className="mt-3 text-sm text-foreground">
          Palmetto Cold Storage is a well-protected FL warehousing risk with a clean 5-year loss history (38% LR),
          92% sprinklered TIV, and revenue growth of 11% CAGR. One open flood claim ($180k reserve) is within
          appetite. Recommend proceeding at an indicated premium of <b>$187,400</b> with a 5% deductible on
          refrigeration mechanical breakdown.
        </p>
        <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
          <div><b className="text-foreground">Suggested subjectivities:</b> updated sprinkler inspection, confirmation of continuous refrigeration monitoring.</div>
          <div><b className="text-foreground">Suggested endorsements:</b> spoilage coverage $500k sub-limit, service interruption 72hr waiting period.</div>
        </div>
      </div>
      <div className="rounded-xl border border-border p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Underwriter decision</div>
        <div className="mt-3 space-y-2 text-sm">
          <Button variant="primary" className="w-full justify-center">Approve recommendation</Button>
          <Button variant="secondary" className="w-full justify-center">Modify & approve</Button>
          <Button variant="secondary" className="w-full justify-center">Send to peer review</Button>
          <Button variant="danger" className="w-full justify-center">Override — decline</Button>
        </div>
        <div className="mt-4 text-[11px] text-muted-foreground">
          Every decision, including overrides, is written to the audit log with a rationale prompt.
        </div>
      </div>
    </div>
  );
}

function ActivityTab() {
  return (
    <ul className="divide-y divide-border">
      {decisionsLog.slice(0, 5).map((d, i) => (
        <li key={i} className="flex items-start gap-3 py-3 text-sm">
          <span className="font-mono text-xs text-muted-foreground">{d.at}</span>
          <div className="flex-1">
            <div><b>{d.who}</b> — {d.what}</div>
            <div className="text-[11px] text-muted-foreground">{d.ctx}</div>
          </div>
          {d.conf !== "—" && <Chip tone="neutral">{d.conf}</Chip>}
        </li>
      ))}
    </ul>
  );
}

/* ============================================================
   2. Renewal Management
   ============================================================ */

export function RenewalManagement() {
  const [selected, setSelected] = useState(renewals[0].id);
  const r = renewals.find((x) => x.id === selected)!;
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 02"
        title="Renewal Management"
        description="Side-by-side prior year vs. renewal submission with an AI-drafted recommendation."
        actions={<Button variant="primary"><Sparkles className="h-4 w-4" />Run renewal review</Button>}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.1fr)]">
        <Panel title="Renewal pipeline" subtitle="Next 60 days">
          <ul className="divide-y divide-border">
            {renewals.map((row) => (
              <button
                key={row.id}
                onClick={() => setSelected(row.id)}
                className={`flex w-full flex-col gap-1 py-3 text-left transition ${selected === row.id ? "bg-secondary/50" : "hover:bg-secondary/30"}`}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{row.insured}</span>
                  <span className="text-xs text-accent">{row.change}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Exp {row.expiring}</span>
                  <span>LR {row.lossRatio}</span>
                </div>
                <Chip tone={row.flag === "Clean" ? "success" : "warn"}>{row.flag}</Chip>
              </button>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-muted-foreground">{r.id}</div>
                <h2 className="mt-1 font-serif text-2xl">{r.insured}</h2>
                <div className="mt-1 text-xs text-muted-foreground">Expires {r.expiring} · Loss ratio 5yr {r.lossRatio}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary">Request information</Button>
                <Button variant="danger">Decline renewal</Button>
                <Button variant="primary">Approve renewal</Button>
              </div>
            </div>
          </Panel>

          <Panel title="Side-by-side comparison" subtitle="Prior policy vs. renewal submission" actions={<FoundationBadge kind="extraction" />}>
            <div className="grid grid-cols-3 gap-0 overflow-hidden rounded-lg border border-border text-sm">
              <div className="bg-secondary/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Attribute</div>
              <div className="bg-secondary/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Prior term</div>
              <div className="bg-secondary/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Renewal</div>
              <Row label="Named insured" prior="Palmetto Cold Storage LLC" now="Palmetto Cold Storage LLC" />
              <Row label="Locations" prior="12" now="14" change="+2" />
              <Row label="TIV" prior="$38.4M" now="$42.8M" change="+11.5%" />
              <Row label="Payroll" prior="$4.2M" now="$4.8M" change="+14.3%" />
              <Row label="Annual revenue" prior="$36.9M" now="$41.2M" change="+11.7%" />
              <Row label="Sprinklered TIV" prior="88%" now="92%" change="+4pp" positive />
              <Row label="Open claims" prior="1" now="1" />
              <Row label="Coverage form" prior="ISO CP 00 10 10 12" now="ISO CP 00 10 10 12" />
              <Row label="Indicated premium" prior={r.priorPremium} now={r.indicated} change={r.change} strong />
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="AI renewal summary" actions={<FoundationBadge kind="decision" />}>
              <p className="text-sm text-foreground">
                Payroll and revenue expansion (~+14% and +12%) plus two new refrigerated locations drive the indicated
                +10.9% rate change. Loss ratio remains excellent at 38%, sprinklered TIV improved to 92%. Recommend
                approval with a spoilage sub-limit refresh and refreshed sprinkler certification.
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                <li>· Broker requested $500k spoilage sub-limit — accept</li>
                <li>· Two new locations in Jacksonville FL — inspected in Nov 2025</li>
                <li>· No changes to loss control program</li>
              </ul>
            </Panel>
            <Panel title="Broker context">
              <div className="text-sm">
                <div className="font-medium">Ana Ruiz · Marsh Southeast</div>
                <div className="text-[11px] text-muted-foreground">Broker for 4 years · 62 bound policies</div>
              </div>
              <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-ink-soft">
                “Insured is expanding into a third Jacksonville location. Would appreciate spoilage sub-limit
                confirmation and a 15-day extension if bind slips past Feb 12.”
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary"><MessageSquare className="h-4 w-4" />Reply in Copilot</Button>
                <Button variant="secondary">View full history</Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, prior, now, change, strong, positive }: { label: string; prior: string; now: string; change?: string; strong?: boolean; positive?: boolean }) {
  return (
    <>
      <div className="border-t border-border px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`border-t border-border px-4 py-2.5 ${strong ? "font-serif" : ""}`}>{prior}</div>
      <div className={`border-t border-border px-4 py-2.5 ${strong ? "font-serif" : ""}`}>
        <span className="mr-2">{now}</span>
        {change && (
          <span className={`text-[11px] font-mono ${positive ? "text-success" : "text-accent"}`}>{change}</span>
        )}
      </div>
    </>
  );
}

/* ============================================================
   3. Broker Communication Copilot
   ============================================================ */

export function BrokerCopilot() {
  const threads = [
    { id: 1, broker: "Ana Ruiz · Marsh Southeast", subject: "Palmetto Cold Storage — renewal Q&A", unread: true, snippet: "Confirming spoilage sub-limit at $500k…", when: "8:42 AM" },
    { id: 2, broker: "Michael Chen · Amwins", subject: "Ridgeline Contractors — missing SOV", unread: true, snippet: "Attached is the schedule you requested…", when: "8:11 AM" },
    { id: 3, broker: "Priya Natarajan · CRC", subject: "Bayou Marine — bind order", unread: false, snippet: "Bind by Friday please…", when: "Yesterday" },
    { id: 4, broker: "Jordan Blake · RT Specialty", subject: "Highline Hospitality — decline letter", unread: false, snippet: "Understood, thanks for the quick turn…", when: "Jan 09" },
  ];
  const [active, setActive] = useState(1);
  const drafts = [
    { title: "Renewal cover email", tone: "Warm", body: "Hi Ana, thanks for the renewal on Palmetto Cold Storage. Please find our indicated terms attached — premium of $187,400 with a $500k spoilage sub-limit and refreshed sprinkler certification. Happy to jump on a call this week." },
    { title: "Missing SOV request", tone: "Direct", body: "Hi Michael, to complete our review on Ridgeline Contractors we still need a current SOV and 5-year loss run. Would you be able to send those today so we can get you terms by Wednesday?" },
    { title: "Decline explanation", tone: "Considerate", body: "Hi Jordan, thanks for thinking of us on Highline Hospitality. After reviewing the loss history and TIV concentration, this one falls outside our appetite for the current book — we'd love to see the rest of your submissions this quarter." },
  ];
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 03"
        title="Broker Communication Copilot"
        description="AI drafts every broker email — renewal cover, missing info, quote summary, decline, follow-up — you approve before it sends."
        actions={<Button variant="primary"><MessageSquare className="h-4 w-4" />New email</Button>}
      />

      <div className="grid gap-0 overflow-hidden rounded-2xl border border-border bg-background lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        {/* Threads */}
        <div className="border-r border-border">
          <div className="border-b border-border p-3"><SearchBar placeholder="Search brokers…" /></div>
          <ul className="divide-y divide-border">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`flex w-full flex-col gap-1 p-3 text-left ${active === t.id ? "bg-secondary/60" : "hover:bg-secondary/30"}`}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t.broker}</span>
                  <span>{t.when}</span>
                </div>
                <div className={`text-sm ${t.unread ? "font-semibold" : ""}`}>{t.subject}</div>
                <div className="truncate text-[11px] text-muted-foreground">{t.snippet}</div>
              </button>
            ))}
          </ul>
        </div>

        {/* Conversation */}
        <div className="flex min-h-[520px] flex-col">
          <div className="border-b border-border p-4">
            <div className="text-xs text-muted-foreground">To: Ana Ruiz &lt;ana.ruiz@marsh.com&gt;</div>
            <div className="font-serif text-lg">Palmetto Cold Storage — renewal Q&A</div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
            <Bubble from="ana" name="Ana Ruiz" at="8:12 AM">
              Hi team — sending over the renewal on Palmetto Cold Storage. Two new locations in Jacksonville. Insured
              would love to confirm the spoilage sub-limit at $500k. Any early read?
            </Bubble>
            <Bubble from="you" name="Coverline AI · drafted" at="8:14 AM" ai>
              Thanks Ana — reviewing now, we'll have indicated terms within the hour. Palmetto's loss history and
              sprinkler profile look strong. We can confirm the $500k spoilage sub-limit.
              <div className="mt-2 flex gap-2 text-xs">
                <Button variant="ghost">Regenerate</Button>
                <Button variant="secondary">Edit</Button>
                <Button variant="primary">Send <Send className="h-3 w-3" /></Button>
              </div>
            </Bubble>
            <Bubble from="ana" name="Ana Ruiz" at="8:31 AM">
              Perfect, thank you. Also — any chance we can extend the effective date to Feb 27 if we slip past Feb 12?
            </Bubble>
            <Bubble from="you" name="Coverline AI · drafted" at="8:42 AM" ai>
              Yes — we can extend to Feb 27 with a short-rate premium adjustment. I'll include the extension endorsement
              in our terms. Attaching the indicated proposal now.
              <div className="mt-2 flex gap-2 text-xs">
                <Button variant="ghost">Regenerate</Button>
                <Button variant="secondary">Edit</Button>
                <Button variant="primary">Send <Send className="h-3 w-3" /></Button>
              </div>
            </Bubble>
          </div>
          <div className="border-t border-border p-3">
            <div className="rounded-xl border border-border bg-background p-2">
              <div className="mb-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <FoundationBadge kind="extraction" />
                <span>·</span>
                <span>AI writer will cite the SOV and loss run in your reply</span>
              </div>
              <textarea
                rows={3}
                defaultValue="Draft attached — please review and send when ready."
                className="w-full resize-none rounded bg-transparent p-2 text-sm outline-none"
              />
              <div className="flex items-center gap-2 border-t border-border pt-2">
                <Button variant="ghost"><Paperclip className="h-4 w-4" /></Button>
                <Button variant="ghost"><Sparkles className="h-4 w-4" />Improve</Button>
                <Button variant="ghost">Rewrite tone</Button>
                <div className="ml-auto"><Button variant="primary">Send <Send className="h-3 w-3" /></Button></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI drafts */}
        <div className="border-l border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Suggested drafts</div>
            <FoundationBadge kind="decision" />
          </div>
          <div className="space-y-3">
            {drafts.map((d) => (
              <div key={d.title} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{d.title}</div>
                  <Chip tone="accent">{d.tone}</Chip>
                </div>
                <p className="mt-1.5 line-clamp-3 text-[11px] text-muted-foreground">{d.body}</p>
                <div className="mt-2 flex justify-end gap-1">
                  <Button variant="ghost" className="!py-1 !text-xs">Preview</Button>
                  <Button variant="secondary" className="!py-1 !text-xs">Use draft</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ children, from, name, at, ai }: { children: ReactNode; from: "ana" | "you"; name: string; at: string; ai?: boolean }) {
  const isYou = from === "you";
  return (
    <div className={`flex gap-3 ${isYou ? "justify-end" : ""}`}>
      {!isYou && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium">AR</div>}
      <div className={`max-w-[75%] rounded-xl border ${isYou ? "border-accent/25 bg-accent/5" : "border-border bg-background"} p-3`}>
        <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{name}</span>
          {ai && <Chip tone="accent"><Sparkles className="h-2.5 w-2.5" /> AI draft</Chip>}
          <span>· {at}</span>
        </div>
        <div className="text-sm">{children}</div>
      </div>
      {isYou && <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-medium text-background">PR</div>}
    </div>
  );
}

/* ============================================================
   4. Endorsement Processing
   ============================================================ */

export function Endorsements() {
  const [sel, setSel] = useState(endorsements[0].id);
  const e = endorsements.find((x) => x.id === sel)!;
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 04"
        title="Endorsement Processing"
        description="AI Difference Engine reads the request, computes the delta against the in-force policy, and prices the change."
        actions={<Button variant="primary">Approve endorsement</Button>}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="Open endorsement requests">
          <ul className="divide-y divide-border">
            {endorsements.map((r) => (
              <button key={r.id} onClick={() => setSel(r.id)} className={`w-full py-3 text-left ${sel === r.id ? "bg-secondary/50" : "hover:bg-secondary/30"}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.insured}</span>
                  <span className="text-[11px] text-muted-foreground">{r.requested}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{r.id} · {r.policy}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Chip tone="accent">{r.type}</Chip>
                  <span className="text-xs">{r.impact}</span>
                </div>
              </button>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-muted-foreground">{e.id} · Policy {e.policy}</div>
                <h2 className="mt-1 font-serif text-2xl">{e.insured}</h2>
                <div className="mt-1 text-xs text-muted-foreground">Requested change: {e.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary">Return to broker</Button>
                <Button variant="primary">Approve · issue endorsement</Button>
              </div>
            </div>
          </Panel>

          <Panel title="AI Difference Engine" subtitle="Before → After" actions={<FoundationBadge kind="extraction" />}>
            <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-border text-sm">
              <div className="bg-secondary/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Change</div>
              <div className="bg-secondary/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">In-force policy</div>
              <div className="bg-secondary/60 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">After endorsement</div>
              <Row label="Locations" prior="14" now="15" change="+1 · Ocala FL" />
              <Row label="TIV" prior="$42.8M" now="$45.2M" change="+$2.4M" />
              <Row label="Sprinklered" prior="92%" now="93%" change="+1pp" positive />
              <Row label="Premium" prior="$187,400" now="$201,600" change="+$14,200" strong />
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Appetite impact" actions={<FoundationBadge kind="decision" />}>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />New location within permitted state list</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />TIV under $250M cap</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Sprinkler threshold maintained</li>
              </ul>
            </Panel>
            <Panel title="Approval workflow">
              <ol className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-success text-background text-xs">1</span>AI reviewed & priced</li>
                <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-accent-foreground text-xs">2</span>Underwriter approval — you</li>
                <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs">3</span>Endorsement issued & written back to PAS</li>
                <li className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-xs">4</span>Broker & insured notified</li>
              </ol>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   5. Quoting & Rating Support
   ============================================================ */

export function Quoting() {
  const [ded, setDed] = useState(25);
  const [limit, setLimit] = useState(5);
  const base = 187400;
  const dedFactor = 1 + (25 - ded) * 0.008;
  const limFactor = 1 + (limit - 5) * 0.12;
  const premium = Math.round(base * dedFactor * limFactor);
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 05"
        title="Quoting & Rating Support"
        description="Interactive quote builder with AI pricing rationale, deductible/limit sensitivity, and profitability projection."
        actions={<Button variant="primary"><Download className="h-4 w-4" />Generate quote PDF</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <Panel title="Configuration" subtitle="Palmetto Cold Storage · Property + GL">
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
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-accent" />Spoilage — $500k sub-limit</label>
                <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-accent" />Service interruption — 72hr</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-accent" />Ordinance & law</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-accent" />Equipment breakdown</label>
              </div>
            </FieldGroup>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Indicated premium" actions={<FoundationBadge kind="decision" />}>
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Annual premium</div>
                <div className="mt-1 font-serif text-5xl leading-none">${premium.toLocaleString()}</div>
                <div className="mt-2 text-xs text-muted-foreground">Rate: ${(premium / 42800).toFixed(2)} per $1k TIV · commission 15%</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="Loss ratio (proj.)" value="41%" sub="±6pp" tone="success" />
                <MetricTile label="Combined ratio" value="87%" sub="Plan 92%" tone="success" />
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-3 text-sm">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" /> AI pricing rationale
              </div>
              <p>
                Base rate reflects FL cold-storage class (loss cost $3.98 per $1k TIV) with a +6% loss-history credit
                and −4% for two coastal locations. Deductible of ${ded}k reduces premium by
                {" "}<b>{((1 - dedFactor) * 100).toFixed(1)}%</b>; excess to ${limit}M adds
                {" "}<b>{((limFactor - 1) * 100).toFixed(1)}%</b>. Recommended terms remain within target margin.
              </p>
            </div>
          </Panel>

          <Panel title="Compare quote options">
            <div className="grid gap-3 md:grid-cols-3">
              <QuoteOption name="Preferred" ded="$25k" limit="$5M" premium="$187,400" lr="41%" active />
              <QuoteOption name="Deductible buy-down" ded="$10k" limit="$5M" premium="$212,600" lr="38%" />
              <QuoteOption name="High-limit" ded="$25k" limit="$10M" premium="$246,800" lr="43%" />
            </div>
          </Panel>
        </div>
      </div>
    </div>
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
function QuoteOption({ name, ded, limit, premium, lr, active }: { name: string; ded: string; limit: string; premium: string; lr: string; active?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${active ? "border-foreground bg-secondary/60" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <div className="font-medium">{name}</div>
        {active && <Chip tone="accent">Selected</Chip>}
      </div>
      <div className="mt-3 font-serif text-2xl">{premium}</div>
      <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
        <div>Deductible {ded}</div>
        <div>Excess {limit}</div>
        <div>Projected LR {lr}</div>
      </div>
    </div>
  );
}

/* ============================================================
   6. Bind Order & Policy Issuance
   ============================================================ */

export function BindOrder() {
  const steps = [
    { label: "Approved submission received", done: true, note: "SUB-24019 · Palmetto Cold Storage" },
    { label: "Outstanding subjectivities", done: true, note: "Sprinkler cert received Jan 09 · monitoring cert Jan 10" },
    { label: "Inspection status", done: true, note: "3 new locations inspected · no material findings" },
    { label: "Payment status", done: true, note: "Down-payment $56,220 received via ACH Jan 11" },
    { label: "Compliance checks", done: true, note: "OFAC clear · surplus lines tax calculated for FL" },
    { label: "AI Bind Recommendation", done: false, active: true, note: "Ready — 6/6 conditions satisfied · 0 exceptions" },
    { label: "Generate binder", done: false, note: "Draft ready for underwriter signature" },
    { label: "Issue policy · write back to PAS", done: false, note: "One-click issuance" },
  ];
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 06"
        title="Bind Order & Policy Issuance"
        description="From approved submission to bound policy — every subjectivity, inspection, and compliance check in one workflow."
        actions={<Button variant="primary">Issue binder</Button>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel title="Palmetto Cold Storage · bind workflow" actions={<FoundationBadge kind="decision" />}>
          <ol className="space-y-3">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${
                    s.done ? "bg-success text-background" : s.active ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {s.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm ${s.active ? "font-medium" : ""}`}>{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.note}</div>
                </div>
                {s.active && <Button variant="primary" className="!py-1 !text-xs">Run</Button>}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="space-y-5">
          <Panel title="AI bind recommendation">
            <div className="rounded-xl border-2 border-success/40 bg-success/5 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <div className="font-serif text-lg">Ready to bind</div>
              </div>
              <p className="mt-2 text-sm">All 6 conditions satisfied. Premium $187,400, effective 02/12/2026. Recommend issuing binder immediately to hold rate.</p>
            </div>
          </Panel>
          <Panel title="Policy issuance">
            <div className="space-y-2 text-sm">
              <ProgressRow label="Binder draft" pct={100} />
              <ProgressRow label="Policy jacket assembly" pct={85} />
              <ProgressRow label="Endorsement schedule" pct={60} />
              <ProgressRow label="Surplus lines filing" pct={30} />
              <ProgressRow label="PAS write-back" pct={0} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function ProgressRow({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs"><span>{label}</span><span className="font-mono text-muted-foreground">{pct}%</span></div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ============================================================
   7. Appetite Governance & Audit
   ============================================================ */

export function AppetiteGovernance() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 07"
        title="Appetite Governance & Audit"
        description="Executive visibility into every decision the AI makes and every override the underwriter takes."
        actions={<Button variant="primary"><Download className="h-4 w-4" />Generate compliance report</Button>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <GovKpi label="Decisions this month" value="1,284" sub="AI + human" />
        <GovKpi label="Overrides" value="42" sub="3.3% override rate" />
        <GovKpi label="Rule performance" value="98.2%" sub="AI aligned with UW" />
        <GovKpi label="Avg AI confidence" value="91%" sub="+2pp vs Q4" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel title="Override frequency by rule">
          <ul className="divide-y divide-border">
            {[
              { rule: "Loss ratio 5yr < 55%", overrides: 12, total: 148 },
              { rule: "TIV under $250M", overrides: 8, total: 132 },
              { rule: "Industry: sawmill excluded", overrides: 6, total: 24 },
              { rule: "No open flood claim > $250k", overrides: 5, total: 61 },
              { rule: "Sprinklered ≥ 80% of TIV", overrides: 4, total: 208 },
            ].map((r) => (
              <li key={r.rule} className="flex items-center gap-3 py-3 text-sm">
                <div className="flex-1"><div className="font-medium">{r.rule}</div><div className="text-[11px] text-muted-foreground">{r.overrides} overrides of {r.total} evaluations</div></div>
                <div className="w-32">
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-accent" style={{ width: `${(r.overrides / r.total) * 100 * 6}%` }} /></div>
                </div>
                <div className="w-10 text-right font-mono text-xs">{((r.overrides / r.total) * 100).toFixed(1)}%</div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Underwriter behavior">
          <ul className="divide-y divide-border">
            {[
              { name: "Priya Rao", decisions: 312, overrides: "3.8%", conf: "92%" },
              { name: "Michael Chen", decisions: 268, overrides: "2.1%", conf: "94%" },
              { name: "Sofia Alvarez", decisions: 214, overrides: "5.6%", conf: "89%" },
              { name: "Emma O'Neill", decisions: 198, overrides: "1.2%", conf: "95%" },
            ].map((u) => (
              <li key={u.name} className="flex items-center gap-3 py-3 text-sm">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-foreground text-xs text-background">{u.name.split(" ").map((n) => n[0]).join("")}</div>
                <div className="flex-1 font-medium">{u.name}</div>
                <div className="text-right text-xs text-muted-foreground">{u.decisions} decisions</div>
                <Chip tone="warn">Override {u.overrides}</Chip>
                <Chip>{u.conf} avg conf.</Chip>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Decision timeline" subtitle="Every AI and human decision, fully auditable" actions={<FoundationBadge kind="decision" />}>
          <ul className="divide-y divide-border">
            {decisionsLog.map((d, i) => (
              <li key={i} className="flex items-start gap-3 py-3 text-sm">
                <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">{d.at}</span>
                <div className="flex-1"><div><b>{d.who}</b> — {d.what}</div><div className="text-[11px] text-muted-foreground">{d.ctx}</div></div>
                {d.conf !== "—" && <Chip>{d.conf}</Chip>}
                <button className="text-[11px] text-muted-foreground hover:text-foreground">View trail →</button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Rule explanations" actions={<FoundationBadge kind="decision" />}>
          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
            <div className="font-medium">“Sawmill excluded”</div>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Historical loss cost on sawmill risks exceeds appetite by 3.4x. Rule added Q3 2024. Overrides require
              Director-level approval and a written rationale, both captured in the audit log.
            </p>
            <div className="mt-3 flex gap-2 text-xs"><Button variant="secondary">Edit rule</Button><Button variant="ghost">See 6 overrides</Button></div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function GovKpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-3xl leading-none">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

/* ============================================================
   8. Portfolio & Book Performance
   ============================================================ */

export function Portfolio() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 08"
        title="Portfolio & Book Performance"
        description="Executive analytics across premium, hit ratio, loss ratio, and renewal retention — with AI-generated commentary."
        actions={<Button variant="secondary"><Download className="h-4 w-4" />Export book pack</Button>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <GovKpi label="Bound premium YTD" value="$48.2M" sub="+14% YoY" />
        <GovKpi label="Hit ratio" value="38.4%" sub="+1.7pp" />
        <GovKpi label="Loss ratio" value="41.6%" sub="Plan 45%" />
        <GovKpi label="Renewal retention" value="92%" sub="+3pp" />
        <GovKpi label="Policies in force" value="2,148" sub="+118 net" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Submission pipeline · trailing 7 months">
          <div className="flex items-end gap-4 pt-2">
            {monthlyPipeline.map((m) => {
              const max = Math.max(...monthlyPipeline.map((x) => x.subs));
              return (
                <div key={m.m} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-48 w-full items-end justify-center gap-1">
                    <div className="w-5 rounded-t bg-foreground/15" style={{ height: `${(m.subs / max) * 100}%` }} />
                    <div className="w-5 rounded-t bg-accent" style={{ height: `${(m.bound / max) * 100}%` }} />
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
                  <div className="w-8">{s.state}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-foreground" style={{ width: `${(s.premium / max) * 100}%` }} /></div>
                  <div className="w-12 text-right font-mono">${s.premium.toFixed(1)}M</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title="Top brokers">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-2 text-left">Broker</th>
                <th className="py-2 text-right">Submissions</th>
                <th className="py-2 text-right">Bound</th>
                <th className="py-2 text-right">Hit ratio</th>
                <th className="py-2 text-right">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brokers.map((b) => (
                <tr key={b.name} className="hover:bg-secondary/40">
                  <td className="py-2.5 font-medium">{b.name}</td>
                  <td className="py-2.5 text-right">{b.submissions}</td>
                  <td className="py-2.5 text-right">{b.bound}</td>
                  <td className="py-2.5 text-right font-mono">{b.hit}</td>
                  <td className="py-2.5 text-right font-mono">{b.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Executive AI insight" actions={<FoundationBadge kind="decision" />}>
          <p className="text-sm">
            The book is outperforming plan on loss ratio (41.6% vs 45%) driven by tighter FL warehousing pricing and
            improved renewal retention (+3pp). Marsh Southeast is the strongest growth channel — recommend a Q1
            capacity conversation. Watch item: CO contractor loss trend is +6pp above the running mean.
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="secondary">Generate board pack</Button>
            <Button variant="ghost">Share with team</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ============================================================
   9. Bordereau Reporting
   ============================================================ */

export function Bordereau() {
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 09"
        title="Bordereau Reporting"
        description="Carrier-ready premium and claims bordereau, generated from source data with validation and citations."
        actions={
          <>
            <Button variant="secondary"><Calendar className="h-4 w-4" />Schedule monthly</Button>
            <Button variant="primary"><Download className="h-4 w-4" />Generate Excel</Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="Carrier templates">
          <ul className="divide-y divide-border">
            {[
              { name: "Carrier A · Premium monthly", policies: 214, next: "Jan 15" },
              { name: "Carrier A · Claims quarterly", policies: 42, next: "Jan 31" },
              { name: "Carrier B · Premium monthly", policies: 168, next: "Jan 20" },
              { name: "Lloyd's Syndicate 2001 · Combined", policies: 96, next: "Feb 05" },
            ].map((t, i) => (
              <li key={t.name} className={`py-3 ${i === 0 ? "" : ""}`}>
                <div className="flex items-center justify-between text-sm"><span className="font-medium">{t.name}</span><Chip tone="warn">Due {t.next}</Chip></div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{t.policies} policies</div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel title="Carrier A · Premium bordereau — January 2026" subtitle="214 policies · $4.86M written premium · $612k commission" actions={<FoundationBadge kind="extraction" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-3 text-left">Policy #</th>
                    <th className="py-2 pr-3 text-left">Insured</th>
                    <th className="py-2 pr-3 text-left">Effective</th>
                    <th className="py-2 pr-3 text-right">Written prem.</th>
                    <th className="py-2 pr-3 text-right">Earned prem.</th>
                    <th className="py-2 pr-3 text-right">Commission</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["COV-24-P-00812", "Palmetto Cold Storage", "02/12/26", "$187,400", "$15,617", "$28,110", "OK"],
                    ["COV-24-P-00776", "Highline Hospitality", "02/20/26", "$421,000", "$35,083", "$63,150", "OK"],
                    ["COV-24-P-00758", "Cedar Grove Living", "03/10/26", "$118,400", "$9,867", "$17,760", "OK"],
                    ["COV-24-P-00741", "Ridgeline Contractors", "03/01/26", "$96,200", "$8,017", "$14,430", "OK"],
                    ["COV-24-P-00722", "Copperline Data Ctr", "02/28/26", "$612,300", "$51,025", "$91,845", "Review"],
                    ["COV-24-P-00701", "Bayou Marine Svcs", "01/30/26", "$312,900", "$26,075", "$46,935", "OK"],
                  ].map((row) => (
                    <tr key={row[0]} className="hover:bg-secondary/40">
                      {row.slice(0, 6).map((c, i) => <td key={i} className="py-2 pr-3 font-mono">{c}</td>)}
                      <td className="py-2 pr-3"><Chip tone={row[6] === "OK" ? "success" : "warn"}>{row[6]}</Chip></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-3">
            <Panel title="Validation">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />214 / 214 rows reconcile with PAS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Commission math verified</li>
                <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warn" />1 row flagged — endorsement mid-period</li>
              </ul>
            </Panel>
            <Panel title="History">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Dec 2025</span><Chip tone="success">Filed</Chip></li>
                <li className="flex justify-between"><span>Nov 2025</span><Chip tone="success">Filed</Chip></li>
                <li className="flex justify-between"><span>Oct 2025</span><Chip tone="success">Filed</Chip></li>
              </ul>
            </Panel>
            <Panel title="Schedule">
              <div className="text-sm">Auto-generate on the <b>15th</b> each month at <b>07:00 ET</b> and email to <b>carrier.a@bordereau.com</b>.</div>
              <div className="mt-3"><Button variant="secondary">Edit schedule</Button></div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
  10. Claims Intake Coordination
   ============================================================ */

export function Claims() {
  const [sel, setSel] = useState(claims[0].id);
  const c = claims.find((x) => x.id === sel)!;
  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 10"
        title="Claims Intake Coordination"
        description="FNOL received → AI extraction → severity prediction → routed to the right carrier and TPA."
        actions={<Button variant="primary">Report new claim</Button>}
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Panel title="Recent FNOLs">
          <ul className="divide-y divide-border">
            {claims.map((r) => (
              <button key={r.id} onClick={() => setSel(r.id)} className={`w-full py-3 text-left ${sel === r.id ? "bg-secondary/50" : "hover:bg-secondary/30"}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.insured}</span>
                  <span className="text-[11px] text-muted-foreground">{r.reported}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{r.id} · {r.type}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Chip tone={r.severity === "High" ? "danger" : r.severity === "Medium" ? "warn" : "success"}>{r.severity}</Chip>
                  <span className="font-mono text-xs">{r.reserve}</span>
                </div>
              </button>
            ))}
          </ul>
        </Panel>

        <div className="space-y-5">
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-muted-foreground">{c.id}</div>
                <h2 className="mt-1 font-serif text-2xl">{c.insured}</h2>
                <div className="mt-1 text-xs text-muted-foreground">{c.type} · reported {c.reported} · reserve {c.reserve}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Notify insured</Button>
                <Button variant="primary">Send to TPA</Button>
              </div>
            </div>
          </Panel>

          <Panel title="AI incident summary" actions={<FoundationBadge kind="extraction" />}>
            <p className="text-sm">
              At approximately 04:12 ET, refrigeration unit R-3 at the Jacksonville facility failed following a
              compressor fault. Loss control was on-site by 06:40. Product loss estimated at $58k (frozen seafood),
              with additional business interruption from a 12-hour outage. No injuries reported.
            </p>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Severity prediction" actions={<FoundationBadge kind="decision" />}>
              <div className="rounded-xl border border-warn/30 bg-warn/5 p-4">
                <div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-warn" /><div className="font-serif text-xl">Medium</div><Chip tone="warn">88% confidence</Chip></div>
                <p className="mt-2 text-sm">Predicted ultimate: <b>$110k – $145k</b>. Comparable to 14 prior refrigeration losses in the past 24 months.</p>
              </div>
            </Panel>
            <Panel title="Routing">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span>Assigned carrier</span><Chip tone="accent">Carrier A</Chip></li>
                <li className="flex justify-between"><span>Assigned TPA</span><Chip>{c.tpa}</Chip></li>
                <li className="flex justify-between"><span>Adjuster</span><span>Ken Whitaker</span></li>
                <li className="flex justify-between"><span>SLA</span><span>24h contact · met</span></li>
              </ul>
            </Panel>
          </div>

          <Panel title="Communication timeline">
            <ul className="space-y-3 text-sm">
              {[
                { at: "08:42", who: "AI · Extraction Core", what: "Parsed FNOL email + 3 photos" },
                { at: "08:44", who: "AI · Decision Core", what: "Severity predicted Medium · reserve $85k suggested" },
                { at: "08:46", who: "Coverline OS", what: "Routed to Sedgwick TPA · adjuster Ken W." },
                { at: "09:12", who: "Sedgwick", what: "Acknowledged assignment · site visit scheduled 11am" },
                { at: "10:04", who: "Insured", what: "Confirmed containment · product moved to backup unit" },
              ].map((e, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[10px] text-muted-foreground">{e.at}</span>
                  <div><b>{e.who}</b> — {e.what}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
