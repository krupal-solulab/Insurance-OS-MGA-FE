import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FileText,
  DollarSign,
  History as HistoryIcon,
  Layers,
  Plus,
  Braces,
  UploadCloud,
  RotateCcw,
  Eye,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ShieldCheck,
  Gavel,
} from "lucide-react";
import { PageHeader } from "./AppShell";
import { Panel } from "./Workflows";
import { cn } from "@/lib/utils";
import { useRole, SeniorOnlyNote } from "./role";

/* ============================================================
   Rules Console
   Senior underwriters author validation rules (as JSON) that
   downstream workflows (Submission Triage, Renewals, …) run
   against extracted submission data.

   - 5 rule sets: ACORD · Financials · Loss Run · SOV · Combined
   - Edit as JSON · Add rule · Publish (immutable version) ·
     Rollback (publishes a clone of a past version) · View history
   - Persisted to localStorage so versions survive reloads
   ============================================================ */

const STORAGE_KEY = "coverline.rules.v1";

type CategoryKey = "ACORD" | "Financials" | "Loss Run" | "SOV" | "Combined" | "Appetite";

const CATEGORIES: { key: CategoryKey; label: string; icon: any; blurb: string }[] = [
  { key: "ACORD", label: "ACORD", icon: FileText, blurb: "Application form completeness & format" },
  { key: "Financials", label: "Financials", icon: DollarSign, blurb: "Revenue, payroll & trend checks" },
  { key: "Loss Run", label: "Loss Run", icon: HistoryIcon, blurb: "Loss history depth & severity" },
  { key: "SOV", label: "SOV", icon: Layers, blurb: "Schedule of values integrity" },
  { key: "Combined", label: "Combined", icon: ShieldCheck, blurb: "Cross-document reconciliation" },
  { key: "Appetite", label: "Appetite", icon: Gavel, blurb: "Account-level underwriting appetite" },
];

type Check = "required" | "regex" | "min" | "max" | "compare" | "crossDoc";
type Severity = "error" | "warn" | "info";

type Rule = {
  id: string;
  label: string;
  field: string;
  check: Check;
  params?: Record<string, unknown>;
  severity: Severity;
  message: string;
  enabled: boolean;
};

type RuleSet = { category: CategoryKey; rules: Rule[] };

type Version = {
  v: number;
  status: "published" | "rolled-back";
  at: string;
  by: string;
  note: string;
  json: string;
};

type CatState = { versions: Version[]; activeV: number; draft: string };
type Store = Record<CategoryKey, CatState>;

/* ---------------------------- helpers ---------------------------- */

const pretty = (o: unknown) => JSON.stringify(o, null, 2);

function safeParse(json: string): { ok: true; value: RuleSet } | { ok: false; error: string } {
  try {
    const value = JSON.parse(json);
    if (!value || typeof value !== "object" || !Array.isArray(value.rules)) {
      return { ok: false, error: "Root must be an object with a `rules` array." };
    }
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function normalize(json: string): string {
  try {
    return JSON.stringify(JSON.parse(json));
  } catch {
    return json;
  }
}

function getPath(obj: any, path: string): unknown {
  return path.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), obj);
}

/* ---------------------------- seed data ---------------------------- */

const ALL_RULES: Record<CategoryKey, Rule[]> = {
  ACORD: [
    { id: "acord-named-insured", label: "Named insured present", field: "acord.namedInsured", check: "required", severity: "error", message: "Named insured is missing from the ACORD 125.", enabled: true },
    { id: "acord-fein-format", label: "FEIN format valid", field: "acord.fein", check: "regex", params: { pattern: "^\\d{2}-\\d{7}$" }, severity: "error", message: "FEIN must be formatted as NN-NNNNNNN.", enabled: true },
    { id: "acord-mailing-address", label: "Mailing address present", field: "acord.mailingAddress", check: "required", severity: "error", message: "Mailing address is missing.", enabled: true },
    { id: "acord-effective-order", label: "Effective before expiration", field: "acord.effectiveDate", check: "compare", params: { op: "lt", field2: "acord.expirationDate" }, severity: "error", message: "Effective date must be earlier than the expiration date.", enabled: true },
    { id: "acord-naics", label: "NAICS classification present", field: "acord.naics", check: "required", severity: "warn", message: "NAICS code is missing — required for appetite routing.", enabled: true },
  ],
  Financials: [
    { id: "fin-revenue-positive", label: "Annual revenue reported", field: "financials.annualRevenue", check: "min", params: { min: 1 }, severity: "error", message: "Annual revenue must be reported and greater than zero.", enabled: true },
    { id: "fin-payroll", label: "Payroll present", field: "financials.payroll", check: "required", severity: "warn", message: "Payroll figure is missing.", enabled: true },
    { id: "fin-history-depth", label: "≥ 3 years of financials", field: "financials.revenueYears", check: "min", params: { min: 3 }, severity: "warn", message: "At least 3 years of financial history is expected.", enabled: true },
    { id: "fin-trend", label: "Revenue trend available", field: "financials.revenueCagr", check: "min", params: { min: 0 }, severity: "info", message: "Revenue CAGR not computable — trend commentary unavailable.", enabled: true },
  ],
  "Loss Run": [
    { id: "loss-depth", label: "≥ 5 years of loss history", field: "lossRun.years", check: "min", params: { min: 5 }, severity: "warn", message: "Fewer than 5 years of loss runs supplied.", enabled: true },
    { id: "loss-ratio-cap", label: "5yr loss ratio ≤ 55%", field: "lossRun.lossRatio5yr", check: "max", params: { max: 0.55 }, severity: "error", message: "5-year loss ratio exceeds appetite threshold of 55%.", enabled: true },
    { id: "loss-open-claims", label: "No open claims", field: "lossRun.openClaims", check: "max", params: { max: 0 }, severity: "warn", message: "Open claim(s) present — review reserves before proceeding.", enabled: true },
    { id: "loss-large-loss", label: "No single loss > $250k", field: "lossRun.largestLoss", check: "max", params: { max: 250000 }, severity: "warn", message: "A single loss exceeds $250k — refer for review.", enabled: true },
  ],
  SOV: [
    { id: "sov-tiv-present", label: "TIV reported", field: "sov.tiv", check: "min", params: { min: 1 }, severity: "error", message: "Total insured value is missing from the SOV.", enabled: true },
    { id: "sov-sprinklered", label: "Sprinklered ≥ 80% of TIV", field: "sov.sprinkleredPct", check: "min", params: { min: 0.8 }, severity: "warn", message: "Sprinklered TIV is below the 80% threshold.", enabled: true },
    { id: "sov-locations", label: "At least one location", field: "sov.locationCount", check: "min", params: { min: 1 }, severity: "info", message: "No locations found on the SOV.", enabled: true },
    { id: "sov-construction", label: "Construction type provided", field: "sov.constructionProvided", check: "required", severity: "warn", message: "Construction type is missing for one or more locations.", enabled: true },
    { id: "sov-tiv-cap", label: "TIV under $250M", field: "sov.tiv", check: "max", params: { max: 250000000 }, severity: "error", message: "TIV exceeds the $250M capacity cap.", enabled: true },
  ],
  Combined: [
    { id: "xdoc-tiv-reconcile", label: "TIV reconciles (SOV vs ACORD 140)", field: "sov.tiv", check: "crossDoc", params: { against: "acord.tiv", tolerancePct: 2 }, severity: "error", message: "SOV total does not reconcile with ACORD 140 TIV within 2%.", enabled: true },
    { id: "xdoc-revenue-reconcile", label: "Revenue reconciles (Financials vs ACORD 125)", field: "financials.annualRevenue", check: "crossDoc", params: { against: "acord.annualRevenue", tolerancePct: 5 }, severity: "error", message: "Financials revenue does not reconcile with the ACORD 125 within 5%.", enabled: true },
    { id: "xdoc-location-match", label: "Location count matches", field: "sov.locationCount", check: "compare", params: { op: "eq", field2: "acord.locationCount" }, severity: "warn", message: "SOV location count does not match the ACORD application.", enabled: true },
    { id: "xdoc-address", label: "Mailing address captured", field: "acord.mailingAddress", check: "required", severity: "info", message: "Cannot verify address consistency — mailing address missing.", enabled: true },
  ],
  Appetite: [
    { id: "app-class", label: "Class captured (in appetite)", field: "acord.naics", check: "required", severity: "error", message: "Class/NAICS missing — cannot confirm the risk is in appetite.", enabled: true },
    { id: "app-tiv-cap", label: "TIV under $250M capacity", field: "sov.tiv", check: "max", params: { max: 250000000 }, severity: "error", message: "TIV exceeds the $250M binding-authority cap.", enabled: true },
    { id: "app-loss-ratio", label: "5yr loss ratio < 55%", field: "lossRun.lossRatio5yr", check: "max", params: { max: 0.55 }, severity: "error", message: "5-year loss ratio exceeds the 55% appetite ceiling.", enabled: true },
    { id: "app-sprinklered", label: "Sprinklered ≥ 80% of TIV", field: "sov.sprinkleredPct", check: "min", params: { min: 0.8 }, severity: "warn", message: "Sprinklered TIV is below the 80% appetite threshold.", enabled: true },
    { id: "app-large-loss", label: "No single loss > $250k", field: "lossRun.largestLoss", check: "max", params: { max: 250000 }, severity: "warn", message: "A single loss exceeds $250k — refer to a senior underwriter.", enabled: true },
  ],
};

// Build a plausible multi-version history for each category so rollback is demoable.
function seedStore(): Store {
  const build = (cat: CategoryKey, cuts: number[], notes: string[], dates: string[], by: string[]): CatState => {
    const versions: Version[] = cuts.map((n, i) => ({
      v: i + 1,
      status: "published",
      at: dates[i],
      by: by[i],
      note: notes[i],
      json: pretty({ category: cat, rules: ALL_RULES[cat].slice(0, n) } satisfies RuleSet),
    }));
    const activeV = versions.length;
    return { versions, activeV, draft: versions[activeV - 1].json };
  };

  return {
    ACORD: build(
      "ACORD",
      [3, 4, 5],
      ["Initial ACORD ruleset", "Added effective-date ordering check", "Required NAICS for appetite routing"],
      ["2025-11-04 09:12", "2025-12-18 14:41", "2026-01-08 10:05"],
      ["Priya Rao", "Priya Rao", "Michael Chen"],
    ),
    Financials: build(
      "Financials",
      [3, 4],
      ["Initial financial checks", "Added revenue-trend availability"],
      ["2025-11-04 09:20", "2026-01-06 16:22"],
      ["Priya Rao", "Sofia Alvarez"],
    ),
    "Loss Run": build(
      "Loss Run",
      [4],
      ["Initial loss-run ruleset"],
      ["2025-11-04 09:31"],
      ["Priya Rao"],
    ),
    SOV: build(
      "SOV",
      [4, 5],
      ["Initial SOV integrity checks", "Added $250M TIV capacity cap"],
      ["2025-11-04 09:44", "2025-12-02 11:18"],
      ["Priya Rao", "Priya Rao"],
    ),
    Combined: build(
      "Combined",
      [2, 3, 4],
      ["TIV + revenue reconciliation", "Added location-count match", "Added address-capture guard"],
      ["2025-11-12 15:03", "2025-12-20 09:57", "2026-01-09 13:30"],
      ["Michael Chen", "Priya Rao", "Priya Rao"],
    ),
    Appetite: build(
      "Appetite",
      [3, 5],
      ["Initial appetite (class · TIV · loss ratio)", "Added sprinkler & large-loss thresholds"],
      ["2025-11-04 09:50", "2025-12-15 10:22"],
      ["Priya Rao", "Priya Rao"],
    ),
  };
}

/* ---------------------------- sample submission ---------------------------- */

const SAMPLE_DOC = {
  meta: { insured: "Palmetto Cold Storage LLC", submission: "SUB-24019" },
  acord: {
    namedInsured: "Palmetto Cold Storage LLC",
    fein: "58-1298347",
    naics: "493120",
    effectiveDate: "2026-02-12",
    expirationDate: "2027-02-12",
    mailingAddress: "4210 Warehouse Rd, Jacksonville FL 32218",
    locationCount: 14,
    tiv: 42800000,
    annualRevenue: 41200000,
  },
  financials: { annualRevenue: 41200000, payroll: 4800000, revenueYears: 5, revenueCagr: 0.11 },
  lossRun: { years: 5, lossRatio5yr: 0.38, openClaims: 1, largestLoss: 180000, totalIncurred: 482000 },
  sov: { tiv: 42800000, locationCount: 14, sprinkleredPct: 0.92, constructionProvided: true },
};

type EvalResult = { rule: Rule; status: "pass" | "fail" | "skip"; detail: string };

function evaluateRule(rule: Rule, data: any): EvalResult {
  if (!rule.enabled) return { rule, status: "skip", detail: "Rule disabled" };
  const value = getPath(data, rule.field);
  const p = rule.params ?? {};
  let pass = false;
  let detail = "";

  switch (rule.check) {
    case "required":
      pass = value !== undefined && value !== null && value !== "";
      detail = pass ? `Found: ${String(value)}` : "Value not found";
      break;
    case "regex":
      pass = value != null && new RegExp(String(p.pattern)).test(String(value));
      detail = `${String(value)} vs /${String(p.pattern)}/`;
      break;
    case "min":
      pass = typeof value === "number" && value >= Number(p.min);
      detail = `${String(value)} ≥ ${String(p.min)}`;
      break;
    case "max":
      pass = typeof value === "number" && value <= Number(p.max);
      detail = `${String(value)} ≤ ${String(p.max)}`;
      break;
    case "compare": {
      const other = getPath(data, String(p.field2));
      const op = String(p.op);
      pass =
        op === "eq" ? value === other :
        op === "lt" ? (value as any) < (other as any) :
        op === "gt" ? (value as any) > (other as any) :
        op === "lte" ? (value as any) <= (other as any) :
        op === "gte" ? (value as any) >= (other as any) : false;
      detail = `${String(value)} ${op} ${String(other)}`;
      break;
    }
    case "crossDoc": {
      const other = getPath(data, String(p.against));
      const tol = Number(p.tolerancePct ?? 0) / 100;
      if (typeof value === "number" && typeof other === "number" && other !== 0) {
        const diff = Math.abs(value - other) / Math.abs(other);
        pass = diff <= tol;
        detail = `Δ ${(diff * 100).toFixed(2)}% (tol ${String(p.tolerancePct)}%)`;
      } else {
        pass = false;
        detail = "Non-numeric or missing value";
      }
      break;
    }
    default:
      pass = false;
      detail = `Unknown check "${rule.check}"`;
  }
  return { rule, status: pass ? "pass" : "fail", detail };
}

/* ---------------------------- local primitives ---------------------------- */

function Button({ children, variant = "secondary", className = "", ...p }: any) {
  const base = "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-50";
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

function SeverityChip({ severity }: { severity: Severity }) {
  const tone = severity === "error" ? "danger" : severity === "warn" ? "warn" : "neutral";
  return <Chip tone={tone}>{severity}</Chip>;
}

/* ---------------------------- main component ---------------------------- */

export function RulesConsole() {
  const [store, setStore] = useState<Store>(() => seedStore());
  const [cat, setCat] = useState<CategoryKey>("ACORD");
  const [viewV, setViewV] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [testResults, setTestResults] = useState<EvalResult[] | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const { role } = useRole();
  const isJunior = role === "junior";

  // Load persisted store after mount (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      // Merge onto the seed so newly-added categories (e.g. Appetite) are always present.
      if (raw) setStore({ ...seedStore(), ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {
      /* ignore quota errors */
    }
  }, [store, hydrated]);

  const cs = store[cat];
  const activeVersion = cs.versions.find((v) => v.v === cs.activeV)!;
  const viewedVersion = viewV != null ? cs.versions.find((v) => v.v === viewV) ?? null : null;

  const editorValue = viewedVersion ? viewedVersion.json : cs.draft;
  const readOnly = viewedVersion != null;

  const parse = useMemo(() => safeParse(editorValue), [editorValue]);
  const dirty = normalize(cs.draft) !== normalize(activeVersion.json);
  const ruleCount = parse.ok ? parse.value.rules.length : 0;

  const patchCat = (updater: (c: CatState) => CatState) =>
    setStore((s) => ({ ...s, [cat]: updater(s[cat]) }));

  const setDraft = (v: string) => {
    if (readOnly) return;
    setTestResults(null);
    patchCat((c) => ({ ...c, draft: v }));
  };

  const switchCat = (next: CategoryKey) => {
    setCat(next);
    setViewV(null);
    setNote("");
    setTestResults(null);
  };

  const formatDraft = () => {
    const r = safeParse(cs.draft);
    if (r.ok) setDraft(pretty(r.value));
  };

  const addRule = () => {
    const r = safeParse(cs.draft);
    if (!r.ok) return;
    const n = r.value.rules.length + 1;
    const template: Rule = {
      id: `${cat.toLowerCase().replace(/\s+/g, "-")}-rule-${n}`,
      label: "New rule",
      field: "acord.fieldName",
      check: "required",
      severity: "warn",
      message: "Describe what fails when this rule does not pass.",
      enabled: true,
    };
    setDraft(pretty({ ...r.value, rules: [...r.value.rules, template] }));
  };

  const publish = () => {
    const r = safeParse(cs.draft);
    if (!r.ok) return;
    patchCat((c) => {
      const nextV = c.versions.length + 1;
      const version: Version = {
        v: nextV,
        status: "published",
        at: nowStamp(),
        by: "Priya Rao",
        note: note.trim() || "Published from console",
        json: pretty(r.value),
      };
      return { versions: [...c.versions, version], activeV: nextV, draft: pretty(r.value) };
    });
    setNote("");
    setViewV(null);
  };

  const rollbackTo = (v: number) => {
    patchCat((c) => {
      const src = c.versions.find((x) => x.v === v);
      if (!src) return c;
      const nextV = c.versions.length + 1;
      const version: Version = {
        v: nextV,
        status: "rolled-back",
        at: nowStamp(),
        by: "Priya Rao",
        note: `Rolled back to v${v}`,
        json: src.json,
      };
      return { versions: [...c.versions, version], activeV: nextV, draft: src.json };
    });
    setViewV(null);
    setNote("");
  };

  const restoreIntoDraft = (v: number) => {
    const src = cs.versions.find((x) => x.v === v);
    if (!src) return;
    patchCat((c) => ({ ...c, draft: src.json }));
    setViewV(null);
  };

  const runTest = () => {
    const r = safeParse(cs.draft);
    if (!r.ok) return;
    setTestResults(r.value.rules.map((rule) => evaluateRule(rule, SAMPLE_DOC)));
  };

  const testSummary = useMemo(() => {
    if (!testResults) return null;
    return {
      errors: testResults.filter((t) => t.status === "fail" && t.rule.severity === "error").length,
      warns: testResults.filter((t) => t.status === "fail" && t.rule.severity === "warn").length,
      infos: testResults.filter((t) => t.status === "fail" && t.rule.severity === "info").length,
      passes: testResults.filter((t) => t.status === "pass").length,
    };
  }, [testResults]);

  return (
    <div className="mx-auto max-w-[1500px]">
      <PageHeader
        eyebrow="Workflow 11 · Governance"
        title="Rules Console"
        description="Author the validation rules every submission is checked against. Edit as JSON, publish an immutable version, and roll back at any time. Rules run in Submission Triage, Renewals, Endorsements, and Claims."
        actions={
          <>
            <Button variant="secondary" onClick={runTest} disabled={!parse.ok}>
              <Play className="h-4 w-4" />
              Test against submission
            </Button>
            <Button variant="primary" onClick={publish} disabled={isJunior || readOnly || !parse.ok || !dirty}>
              <UploadCloud className="h-4 w-4" />
              Publish version
            </Button>
          </>
        }
      />

      {isJunior && (
        <SeniorOnlyNote>
          View only — appetite &amp; validation rules are authored, published, and rolled back by a <b className="text-foreground">senior underwriter</b>. Switch to Senior UW to edit.
        </SeniorOnlyNote>
      )}

      {/* Category selector */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {CATEGORIES.map((c) => {
          const s = store[c.key];
          const active = c.key === cat;
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => switchCat(c.key)}
              className={cn(
                "rounded-xl border p-4 text-left transition",
                active ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40",
              )}
            >
              <div className="flex items-center justify-between">
                <Icon className={cn("h-4 w-4", active ? "text-background" : "text-accent")} />
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-mono", active ? "bg-background/15" : "bg-secondary")}>
                  v{s.activeV}
                </span>
              </div>
              <div className="mt-3 font-serif text-lg leading-none">{c.label}</div>
              <div className={cn("mt-1.5 text-[11px]", active ? "text-background/70" : "text-muted-foreground")}>{c.blurb}</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        {/* Editor column */}
        <div className="space-y-5">
          <Panel
            title={`${cat} ruleset`}
            subtitle={readOnly ? `Viewing v${viewedVersion!.v} · read-only` : `Editing draft · based on active v${cs.activeV}`}
            actions={
              <div className="flex items-center gap-2">
                {readOnly ? (
                  <>
                    <Button variant="secondary" onClick={() => restoreIntoDraft(viewedVersion!.v)} disabled={isJunior}>
                      <RotateCcw className="h-4 w-4" />
                      Restore to draft
                    </Button>
                    <Button variant="ghost" onClick={() => setViewV(null)}>Close</Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={addRule} disabled={isJunior || !parse.ok}>
                      <Plus className="h-4 w-4" />
                      Add rule
                    </Button>
                    <Button variant="ghost" onClick={formatDraft} disabled={isJunior || !parse.ok}>
                      <Braces className="h-4 w-4" />
                      Format
                    </Button>
                  </>
                )}
              </div>
            }
          >
            {/* Status line */}
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px]">
              {parse.ok ? (
                <Chip tone="success">
                  <CheckCircle2 className="h-3 w-3" />
                  Valid JSON · {ruleCount} rules
                </Chip>
              ) : (
                <Chip tone="danger">
                  <XCircle className="h-3 w-3" />
                  Invalid JSON
                </Chip>
              )}
              {!readOnly && dirty && <Chip tone="warn">Unpublished changes</Chip>}
              {!readOnly && !dirty && <Chip tone="neutral">In sync with v{cs.activeV}</Chip>}
            </div>

            <textarea
              spellCheck={false}
              readOnly={readOnly || isJunior}
              value={editorValue}
              onChange={(e) => setDraft(e.target.value)}
              className={cn(
                "h-[420px] w-full resize-y rounded-lg border border-border p-3 font-mono text-[12px] leading-relaxed outline-none focus:border-foreground/40",
                readOnly ? "bg-secondary/40 text-ink-soft" : "bg-paper",
              )}
            />

            {!parse.ok && (
              <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-[12px] text-destructive">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" /> Cannot publish
                </div>
                <div className="mt-1 font-mono text-[11px]">{(parse as any).error}</div>
              </div>
            )}

            {!readOnly && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Version note (optional) — e.g. 'Tightened TIV cap to $200M'"
                  className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-foreground/40"
                />
                <Button variant="primary" onClick={publish} disabled={isJunior || !parse.ok || !dirty}>
                  <UploadCloud className="h-4 w-4" />
                  Publish v{cs.versions.length + 1}
                </Button>
              </div>
            )}
          </Panel>

          {/* Parsed rule preview */}
          {parse.ok && (
            <Panel title="Rules in this set" subtitle="Rendered from the JSON above" actions={<FoundationLink />}>
              <ul className="divide-y divide-border">
                {parse.value.rules.map((r) => (
                  <li key={r.id} className="flex items-start gap-3 py-3 text-sm">
                    <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", r.enabled ? "bg-accent" : "bg-border")} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{r.label}</span>
                        <SeverityChip severity={r.severity} />
                        {!r.enabled && <Chip tone="neutral">disabled</Chip>}
                      </div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                        {r.field} · {r.check}
                        {r.params ? ` · ${Object.entries(r.params).map(([k, v]) => `${k}=${v}`).join(", ")}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        {/* History + test column */}
        <div className="space-y-5">
          <Panel title="Version history" subtitle={`${cs.versions.length} versions · immutable`} actions={<HistoryIcon className="h-4 w-4 text-muted-foreground" />}>
            <ul className="space-y-2">
              {[...cs.versions].reverse().map((v) => {
                const isActive = v.v === cs.activeV;
                const isViewing = v.v === viewV;
                return (
                  <li
                    key={v.v}
                    className={cn(
                      "rounded-lg border p-3",
                      isActive ? "border-foreground/40 bg-secondary/50" : "border-border",
                      isViewing && "ring-1 ring-accent",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">v{v.v}</span>
                      {isActive ? <Chip tone="success">Active</Chip> : v.status === "rolled-back" ? <Chip tone="warn">Rolled back</Chip> : <Chip tone="neutral">Published</Chip>}
                      <span className="ml-auto text-[11px] text-muted-foreground">{v.at}</span>
                    </div>
                    <div className="mt-1.5 text-sm">{v.note}</div>
                    <div className="text-[11px] text-muted-foreground">by {v.by}</div>
                    <div className="mt-2 flex items-center gap-1">
                      <Button variant="ghost" className="!py-1 !text-xs" onClick={() => setViewV(isViewing ? null : v.v)}>
                        <Eye className="h-3.5 w-3.5" />
                        {isViewing ? "Hide" : "View"}
                      </Button>
                      <Button
                        variant="secondary"
                        className="!py-1 !text-xs"
                        onClick={() => rollbackTo(v.v)}
                        disabled={isActive || isJunior}
                        title={isJunior ? "Senior underwriters roll back rules" : isActive ? "This version is already active" : `Publish a copy of v${v.v} as the active version`}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Rollback
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            title="Validation preview"
            subtitle="Run the draft against a sample submission"
            actions={<Button variant="secondary" className="!py-1 !text-xs" onClick={runTest} disabled={!parse.ok}><Play className="h-3.5 w-3.5" />Run</Button>}
          >
            <div className="mb-3 rounded-lg border border-border bg-secondary/40 p-3 text-[11px] text-muted-foreground">
              Sample: <b className="text-foreground">{SAMPLE_DOC.meta.insured}</b> · {SAMPLE_DOC.meta.submission}
            </div>

            {!testResults && (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Run the ruleset to see how the sample submission scores.
              </div>
            )}

            {testResults && testSummary && (
              <>
                <div className="mb-3 grid grid-cols-4 gap-2 text-center">
                  <SummaryTile label="Pass" value={testSummary.passes} tone="success" />
                  <SummaryTile label="Error" value={testSummary.errors} tone="danger" />
                  <SummaryTile label="Warn" value={testSummary.warns} tone="warn" />
                  <SummaryTile label="Info" value={testSummary.infos} tone="neutral" />
                </div>
                <ul className="divide-y divide-border">
                  {testResults.map((t) => (
                    <li key={t.rule.id} className="flex items-start gap-3 py-2.5 text-sm">
                      <ResultIcon result={t} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{t.rule.label}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{t.detail}</div>
                        {t.status === "fail" && <div className="mt-0.5 text-[11px] text-muted-foreground">{t.rule.message}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 text-[10px] text-muted-foreground">
                  {testSummary.errors === 0
                    ? "No blocking errors — this ruleset would let the sample proceed to triage."
                    : `${testSummary.errors} blocking error(s) — the sample would be held for review.`}
                </div>
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SummaryTile({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" | "warn" | "neutral" }) {
  const cls =
    tone === "success" ? "text-success" : tone === "danger" ? "text-destructive" : tone === "warn" ? "text-warn" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border p-2">
      <div className={`font-serif text-xl leading-none ${cls}`}>{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function ResultIcon({ result }: { result: EvalResult }) {
  if (result.status === "skip") return <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
  if (result.status === "pass") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />;
  const sev = result.rule.severity;
  if (sev === "error") return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />;
  if (sev === "warn") return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />;
  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
}

function FoundationLink() {
  return (
    <Link
      to="/app/foundation/decision-core"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground hover:border-foreground/40"
      title="Powered by Decision Core"
    >
      <Gavel className="h-3 w-3 text-accent" />
      Decision Core
    </Link>
  );
}
