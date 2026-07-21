// Realistic-ish commercial insurance mock data for the Coverline prototype.

export type Submission = {
  id: string;
  broker: string;
  brokerage: string;
  insured: string;
  industry: string;
  state: string;
  tiv: string;
  premium: string;
  effective: string;
  received: string;
  status: "New" | "Extracting" | "Scored" | "In review" | "Quoted" | "Declined" | "Bound";
  score: number;
  appetite: "In appetite" | "Marginal" | "Out of appetite";
  recommendation: "Proceed" | "Request info" | "Decline";
  lob: string;
};

export const submissions: Submission[] = [
  { id: "SUB-24019", broker: "Ana Ruiz", brokerage: "Marsh Southeast", insured: "Palmetto Cold Storage LLC", industry: "Warehousing / cold storage", state: "FL", tiv: "$42.8M", premium: "$187,400", effective: "Feb 12, 2026", received: "2h ago", status: "Scored", score: 82, appetite: "In appetite", recommendation: "Proceed", lob: "Property + GL" },
  { id: "SUB-24018", broker: "Michael Chen", brokerage: "Amwins Access", insured: "Ridgeline Contractors, Inc.", industry: "General contractor", state: "CO", tiv: "$18.2M", premium: "$96,200", effective: "Mar 01, 2026", received: "3h ago", status: "In review", score: 71, appetite: "Marginal", recommendation: "Request info", lob: "GL + Excess" },
  { id: "SUB-24017", broker: "Priya Natarajan", brokerage: "CRC Group", insured: "Bayou Marine Services", industry: "Marine terminal ops", state: "LA", tiv: "$61.4M", premium: "$312,900", effective: "Jan 30, 2026", received: "5h ago", status: "Extracting", score: 0, appetite: "In appetite", recommendation: "Proceed", lob: "Property + Marine" },
  { id: "SUB-24016", broker: "Jordan Blake", brokerage: "RT Specialty", insured: "Highline Hospitality Group", industry: "Hotels / restaurants", state: "NV", tiv: "$88.0M", premium: "$421,000", effective: "Feb 20, 2026", received: "8h ago", status: "Quoted", score: 76, appetite: "In appetite", recommendation: "Proceed", lob: "Property + Liquor" },
  { id: "SUB-24015", broker: "Sofia Alvarez", brokerage: "Burns & Wilcox", insured: "Northwind Wood Products", industry: "Sawmill / wood mfg", state: "OR", tiv: "$27.5M", premium: "$142,800", effective: "Feb 04, 2026", received: "1d ago", status: "Declined", score: 38, appetite: "Out of appetite", recommendation: "Decline", lob: "Property" },
  { id: "SUB-24014", broker: "Ken Whitaker", brokerage: "Worldwide Facilities", insured: "Ironclad Salvage & Recycling", industry: "Metal recycling", state: "TX", tiv: "$14.6M", premium: "$78,900", effective: "Feb 15, 2026", received: "1d ago", status: "In review", score: 58, appetite: "Marginal", recommendation: "Request info", lob: "GL + Property" },
  { id: "SUB-24013", broker: "Emma O'Neill", brokerage: "Risk Placement Svcs.", insured: "Cedar Grove Assisted Living", industry: "Senior care", state: "PA", tiv: "$22.1M", premium: "$118,400", effective: "Mar 10, 2026", received: "2d ago", status: "Bound", score: 84, appetite: "In appetite", recommendation: "Proceed", lob: "GL + Prof Liab" },
  { id: "SUB-24012", broker: "Diego Fernandes", brokerage: "AmWINS Brokerage", insured: "Copperline Data Center Ops", industry: "Data center", state: "VA", tiv: "$134.9M", premium: "$612,300", effective: "Feb 28, 2026", received: "2d ago", status: "Quoted", score: 88, appetite: "In appetite", recommendation: "Proceed", lob: "Property + Cyber" },
];

export type Document = {
  name: string;
  kind: "ACORD 125" | "ACORD 140" | "Loss Run" | "SOV" | "Financials" | "Email" | "Inspection";
  pages: number;
  extractedFields: number;
  confidence: number;
};

export const submissionDocs: Document[] = [
  { name: "ACORD_125_Palmetto.pdf", kind: "ACORD 125", pages: 4, extractedFields: 42, confidence: 0.98 },
  { name: "ACORD_140_Palmetto.pdf", kind: "ACORD 140", pages: 3, extractedFields: 28, confidence: 0.96 },
  { name: "Palmetto_SOV_2026.xlsx", kind: "SOV", pages: 1, extractedFields: 117, confidence: 0.94 },
  { name: "Loss_Run_5yr.pdf", kind: "Loss Run", pages: 6, extractedFields: 34, confidence: 0.91 },
  { name: "Financials_FY24.pdf", kind: "Financials", pages: 12, extractedFields: 61, confidence: 0.88 },
  { name: "Broker_Cover_Email.eml", kind: "Email", pages: 1, extractedFields: 9, confidence: 0.99 },
];

export const appetiteRules = [
  { rule: "TIV under $250M", pass: true, detail: "$42.8M — well under limit" },
  { rule: "State: not CA / HI wildfire zone", pass: true, detail: "FL — allowed" },
  { rule: "Industry: warehousing permitted", pass: true, detail: "Cold storage in permitted NAICS" },
  { rule: "Loss ratio 5yr < 55%", pass: true, detail: "38% actual" },
  { rule: "No open flood claim > $250k", pass: false, detail: "One open flood claim, reserved $180k — under threshold" },
  { rule: "Sprinklered ≥ 80% of TIV", pass: true, detail: "92% sprinklered per SOV" },
];

export const renewals = [
  { id: "REN-24-4102", insured: "Palmetto Cold Storage LLC", expiring: "Feb 12, 2026", priorPremium: "$168,900", indicated: "$187,400", change: "+10.9%", lossRatio: "38%", flag: "Payroll +14%" },
  { id: "REN-24-4101", insured: "Highline Hospitality Group", expiring: "Feb 20, 2026", priorPremium: "$388,200", indicated: "$421,000", change: "+8.4%", lossRatio: "42%", flag: "New location added" },
  { id: "REN-24-4100", insured: "Cedar Grove Assisted Living", expiring: "Mar 10, 2026", priorPremium: "$112,700", indicated: "$118,400", change: "+5.1%", lossRatio: "29%", flag: "Clean" },
  { id: "REN-24-4099", insured: "Ridgeline Contractors, Inc.", expiring: "Mar 01, 2026", priorPremium: "$91,400", indicated: "$96,200", change: "+5.3%", lossRatio: "44%", flag: "Class code change" },
  { id: "REN-24-4098", insured: "Copperline Data Center Ops", expiring: "Feb 28, 2026", priorPremium: "$584,100", indicated: "$612,300", change: "+4.8%", lossRatio: "12%", flag: "Cyber sublimit request" },
];

export const endorsements = [
  { id: "END-8814", policy: "COV-24-P-00812", insured: "Palmetto Cold Storage LLC", type: "Add location", requested: "Today", impact: "+$14,200 premium" },
  { id: "END-8813", policy: "COV-24-P-00776", insured: "Highline Hospitality Group", type: "Increase limits", requested: "Yesterday", impact: "+$9,600 premium" },
  { id: "END-8812", policy: "COV-24-P-00758", insured: "Cedar Grove Assisted Living", type: "Add insured", requested: "2d ago", impact: "No premium change" },
  { id: "END-8811", policy: "COV-24-P-00741", insured: "Ridgeline Contractors, Inc.", type: "Remove vehicle", requested: "3d ago", impact: "-$1,140 premium" },
];

export const claims = [
  { id: "CLM-33210", insured: "Palmetto Cold Storage LLC", type: "Refrigeration failure", reported: "2h ago", severity: "Medium", reserve: "$85,000", tpa: "Sedgwick" },
  { id: "CLM-33209", insured: "Bayou Marine Services", type: "Cargo damage", reported: "6h ago", severity: "Low", reserve: "$22,500", tpa: "Gallagher Bassett" },
  { id: "CLM-33208", insured: "Highline Hospitality Group", type: "Slip & fall", reported: "1d ago", severity: "Low", reserve: "$18,000", tpa: "Crawford & Co." },
  { id: "CLM-33207", insured: "Ironclad Salvage & Recycling", type: "Fire — baler", reported: "2d ago", severity: "High", reserve: "$412,000", tpa: "Sedgwick" },
];

export const brokers = [
  { name: "Marsh Southeast", submissions: 148, bound: 62, hit: "42%", premium: "$4.8M" },
  { name: "Amwins Access", submissions: 132, bound: 51, hit: "39%", premium: "$4.1M" },
  { name: "CRC Group", submissions: 121, bound: 44, hit: "36%", premium: "$3.6M" },
  { name: "RT Specialty", submissions: 98, bound: 39, hit: "40%", premium: "$3.2M" },
  { name: "Burns & Wilcox", submissions: 87, bound: 22, hit: "25%", premium: "$1.9M" },
];

export const stateMix = [
  { state: "TX", premium: 4.6 },
  { state: "FL", premium: 4.1 },
  { state: "CA", premium: 3.4 },
  { state: "GA", premium: 2.2 },
  { state: "NY", premium: 2.0 },
  { state: "PA", premium: 1.6 },
  { state: "NC", premium: 1.4 },
  { state: "CO", premium: 1.1 },
  { state: "VA", premium: 0.9 },
  { state: "LA", premium: 0.7 },
];

export const monthlyPipeline = [
  { m: "Jul", subs: 182, bound: 68 },
  { m: "Aug", subs: 204, bound: 79 },
  { m: "Sep", subs: 221, bound: 84 },
  { m: "Oct", subs: 240, bound: 91 },
  { m: "Nov", subs: 258, bound: 96 },
  { m: "Dec", subs: 231, bound: 88 },
  { m: "Jan", subs: 274, bound: 104 },
];

export const decisionsLog = [
  { at: "09:42", who: "AI (Decision Core)", what: "Recommended PROCEED", ctx: "SUB-24019 · Palmetto Cold Storage", conf: "94%" },
  { at: "09:41", who: "AI (Extraction Core)", what: "Cross-doc validation passed", ctx: "SUB-24019 · 6 documents", conf: "97%" },
  { at: "09:28", who: "Priya N. (UW)", what: "Approved renewal", ctx: "REN-24-4100 · Cedar Grove", conf: "—" },
  { at: "09:11", who: "AI (Decision Core)", what: "Flagged out-of-appetite", ctx: "SUB-24015 · Northwind Wood Products", conf: "88%" },
  { at: "08:52", who: "AI (Extraction Core)", what: "Loss run parsed (5 yr)", ctx: "SUB-24018 · Ridgeline Contractors", conf: "91%" },
  { at: "08:33", who: "Michael C. (UW)", what: "Override — approved marginal", ctx: "SUB-24014 · Ironclad Salvage", conf: "—" },
];

/* ============================================================
   Submission Triage — PRD-aligned detail model.
   Everything below is mock data shaped like the PRD's output
   package (Section 7.4) so a backend can replace this module
   without changing the UI. Nothing here is computed at runtime.
   ============================================================ */

export type TriageRecommendation = "PROCEED" | "REQUEST_INFO" | "DECLINE";
export type ProcessingState = "queued" | "extracting" | "ready" | "error";

export type ExtractedField = {
  key: string;
  label: string;
  value: string | null; // null => "not available in submitted documents"
  required: boolean;
  confidence: number; // 0–1
  source?: string; // citation, e.g. "ACORD 125 p.1"
};

export type TriageDoc = {
  name: string;
  kind: string; // "ACORD 125" | ... | "Unknown"
  pages: number;
  fields: number;
  confidence: number; // classification confidence 0–1
  classified: boolean; // false => routes to manual classification queue
};

export type ConsistencyCheck = { label: string; detail: string; status: "ok" | "warn" | "fail" };
export type MissingItem = { item: string; reason: string; severity: "required" | "recommended" };
export type RiskFactor = { name: string; value: string; weight: number };
export type AppetiteResult = { rule: string; pass: boolean; hard: boolean; detail: string };
export type ActivityEntry = { at: string; who: string; what: string; ctx?: string; conf?: string };
export type LossMetrics = {
  totalIncurred: string;
  totalPaid: string;
  openClaims: number;
  years: number;
  required: number;
  trend: "improving" | "worsening" | "flat";
};

export type TriageDetail = {
  recommendation: TriageRecommendation;
  confidence: number;
  hardRulePassed: boolean;
  failedRules: string[];
  processing: ProcessingState;
  rulesVersion: string; // ties to Rules Console versions
  meta: { received: string[]; lowConfidence: string[]; timestamp: string };
  docs: TriageDoc[];
  fields: ExtractedField[];
  loss: LossMetrics;
  consistency: ConsistencyCheck[];
  missingInfo: MissingItem[];
  factors: RiskFactor[];
  narrative: string;
  citations: string[];
  appetite: AppetiteResult[];
  activity: ActivityEntry[];
};

export const RECOMMENDATION_LABEL: Record<TriageRecommendation, string> = {
  PROCEED: "Proceed",
  REQUEST_INFO: "Request info",
  DECLINE: "Decline",
};

// Explicit rich details for the representative submissions.
const explicitTriage: Record<string, TriageDetail> = {
  "SUB-24019": {
    recommendation: "PROCEED",
    confidence: 0.94,
    hardRulePassed: true,
    failedRules: [],
    processing: "ready",
    rulesVersion: "ACORD v3 · Combined v3",
    meta: {
      received: ["ACORD_125_Palmetto.pdf", "ACORD_140_Palmetto.pdf", "Palmetto_SOV_2026.xlsx", "Loss_Run_5yr.pdf", "Financials_FY24.pdf", "Broker_Cover_Email.eml"],
      lowConfidence: ["Site_Photos.zip"],
      timestamp: "Today · 09:42 ET",
    },
    docs: [
      { name: "ACORD_125_Palmetto.pdf", kind: "ACORD 125", pages: 4, fields: 42, confidence: 0.98, classified: true },
      { name: "ACORD_140_Palmetto.pdf", kind: "ACORD 140", pages: 3, fields: 28, confidence: 0.96, classified: true },
      { name: "Palmetto_SOV_2026.xlsx", kind: "SOV", pages: 1, fields: 117, confidence: 0.94, classified: true },
      { name: "Loss_Run_5yr.pdf", kind: "Loss Run", pages: 6, fields: 34, confidence: 0.91, classified: true },
      { name: "Financials_FY24.pdf", kind: "Financials", pages: 12, fields: 61, confidence: 0.88, classified: true },
      { name: "Site_Photos.zip", kind: "Unknown", pages: 0, fields: 0, confidence: 0.42, classified: false },
    ],
    fields: [
      { key: "named_insured", label: "Named insured", value: "Palmetto Cold Storage LLC", required: true, confidence: 0.99, source: "ACORD 125 p.1" },
      { key: "fein", label: "FEIN", value: "58-1298347", required: false, confidence: 0.97, source: "ACORD 125 p.1" },
      { key: "address", label: "Mailing address", value: "4210 Warehouse Rd, Jacksonville FL 32218", required: true, confidence: 0.96, source: "ACORD 125 p.1" },
      { key: "class", label: "Class / NAICS", value: "Cold storage warehousing (493120)", required: true, confidence: 0.95, source: "ACORD 125 p.2" },
      { key: "effective", label: "Effective date", value: "02/12/2026", required: true, confidence: 0.98, source: "ACORD 125 p.1" },
      { key: "expiration", label: "Expiration date", value: "02/12/2027", required: true, confidence: 0.98, source: "ACORD 125 p.1" },
      { key: "tiv", label: "TIV", value: "$42.8M", required: true, confidence: 0.94, source: "SOV · ACORD 140" },
      { key: "revenue", label: "Annual revenue", value: "$41.2M", required: false, confidence: 0.9, source: "Financials FY24 p.3" },
      { key: "prior_premium", label: "Prior premium", value: "$168,900", required: false, confidence: 0.93, source: "ACORD 125 p.3" },
      { key: "sprinklered", label: "Sprinklered %", value: "92%", required: false, confidence: 0.89, source: "SOV" },
    ],
    loss: { totalIncurred: "$482,000", totalPaid: "$302,000", openClaims: 1, years: 5, required: 5, trend: "flat" },
    consistency: [
      { label: "Revenue: ACORD 125 vs Financials", detail: "$41.2M matches audited P&L (0% variance)", status: "ok" },
      { label: "TIV: ACORD 140 vs SOV", detail: "$42.8M reconciles across 14 locations", status: "ok" },
      { label: "Loss disclosure vs loss run", detail: "Disclosed losses match 5-yr run", status: "ok" },
      { label: "Effective-date feasibility", detail: "Effective 02/12/2026 — 22 days out, feasible", status: "ok" },
      { label: "Sprinklered %: SOV vs prior inspection", detail: "SOV 92% vs prior inspection 88% — reviewer suggested", status: "warn" },
    ],
    missingInfo: [
      { item: "Updated sprinkler inspection for 2 new Jacksonville locations", reason: "SOV lists 92% but last inspection predates the new locations", severity: "recommended" },
      { item: "Continuous refrigeration monitoring certification", reason: "Required for spoilage sub-limit endorsement", severity: "recommended" },
    ],
    factors: [
      { name: "Loss history (5yr)", value: "38% loss ratio", weight: 18 },
      { name: "Sprinklered TIV", value: "92%", weight: 12 },
      { name: "Revenue stability", value: "3yr CAGR +11%", weight: 8 },
      { name: "Coastal FL flood zone", value: "Zone X · non-SFHA", weight: 6 },
      { name: "Cold-storage class", value: "Elevated freeze/mech loss", weight: -9 },
      { name: "Open flood claim", value: "$180k reserve", weight: -4 },
    ],
    narrative:
      "Palmetto Cold Storage is a well-protected FL warehousing risk with a clean 5-year loss history (38% LR), 92% sprinklered TIV, and revenue growth of 11% CAGR. One open flood claim ($180k reserve) is within appetite. Recommend proceeding at an indicated premium of $187,400 with a 5% deductible on refrigeration mechanical breakdown.",
    citations: ["ACORD_125_Palmetto.pdf p.2", "Loss_Run_5yr.pdf p.4", "Palmetto_SOV_2026.xlsx"],
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$42.8M — well under limit" },
      { rule: "State not in CA/HI wildfire zone", pass: true, hard: true, detail: "FL — allowed" },
      { rule: "Class code permitted (warehousing)", pass: true, hard: true, detail: "Cold storage in permitted NAICS" },
      { rule: "Loss ratio 5yr < 55%", pass: true, hard: false, detail: "38% actual" },
      { rule: "No open flood claim > $250k", pass: false, hard: false, detail: "One open flood claim, reserved $180k — under threshold" },
      { rule: "Sprinklered ≥ 80% of TIV", pass: true, hard: true, detail: "92% sprinklered per SOV" },
    ],
    activity: [
      { at: "08:33", who: "AI · Extraction Core", what: "Email ingested · 6 attachments", ctx: "Marsh Southeast", conf: "—" },
      { at: "09:41", who: "AI · Extraction Core", what: "Cross-doc validation passed", ctx: "0 conflicts · 291 fields", conf: "97%" },
      { at: "09:42", who: "AI · Decision Core", what: "Recommended PROCEED", ctx: "5 of 6 appetite rules pass", conf: "94%" },
    ],
  },

  "SUB-24018": {
    recommendation: "REQUEST_INFO",
    confidence: 0.71,
    hardRulePassed: true,
    failedRules: [],
    processing: "ready",
    rulesVersion: "ACORD v3 · Combined v3",
    meta: { received: ["ACORD_125_Ridgeline.pdf", "Loss_Run_Ridgeline.pdf", "Broker_Email.eml"], lowConfidence: [], timestamp: "Today · 08:52 ET" },
    docs: [
      { name: "ACORD_125_Ridgeline.pdf", kind: "ACORD 125", pages: 4, fields: 38, confidence: 0.95, classified: true },
      { name: "Loss_Run_Ridgeline.pdf", kind: "Loss Run", pages: 2, fields: 12, confidence: 0.9, classified: true },
      { name: "Broker_Email.eml", kind: "Email", pages: 1, fields: 6, confidence: 0.98, classified: true },
    ],
    fields: [
      { key: "named_insured", label: "Named insured", value: "Ridgeline Contractors, Inc.", required: true, confidence: 0.98, source: "ACORD 125 p.1" },
      { key: "class", label: "Class / NAICS", value: "General contractor", required: true, confidence: 0.93, source: "ACORD 125 p.2" },
      { key: "effective", label: "Effective date", value: "03/01/2026", required: true, confidence: 0.97, source: "ACORD 125 p.1" },
      { key: "tiv", label: "TIV", value: "$18.2M", required: true, confidence: 0.9, source: "ACORD 125" },
      { key: "sov", label: "Statement of values", value: null, required: true, confidence: 0, source: undefined },
      { key: "revenue", label: "Annual revenue", value: null, required: false, confidence: 0, source: undefined },
    ],
    loss: { totalIncurred: "$214,000", totalPaid: "$150,000", openClaims: 2, years: 2, required: 5, trend: "worsening" },
    consistency: [
      { label: "Loss-run history depth", detail: "Loss run covers 2024–2025 only; 5 years required", status: "fail" },
      { label: "TIV: ACORD vs SOV", detail: "No SOV provided — cannot reconcile", status: "warn" },
      { label: "Effective-date feasibility", detail: "Effective 03/01/2026 — feasible", status: "ok" },
    ],
    missingInfo: [
      { item: "Current Statement of Values (SOV)", reason: "Required for property TIV verification; none in submission", severity: "required" },
      { item: "5-year loss run", reason: "Loss run provided covers only 2024–2025; 5 years required by appetite", severity: "required" },
      { item: "Updated financials", reason: "Annual revenue not stated; needed for premium sizing", severity: "recommended" },
    ],
    factors: [
      { name: "Loss trend (2yr)", value: "Worsening — 2 open claims", weight: -12 },
      { name: "Class (GC)", value: "Standard appetite", weight: 4 },
      { name: "Documentation completeness", value: "SOV + 3yr loss run missing", weight: -10 },
    ],
    narrative:
      "Ridgeline Contractors is a general contractor risk within class appetite, but the submission is incomplete: no SOV and only 2 years of loss history (5 required). The 2-year loss trend is worsening with 2 open claims. Recommend requesting the missing SOV and full 5-year loss run before scoring — a decision cannot be made on the current record.",
    citations: ["ACORD_125_Ridgeline.pdf p.2", "Loss_Run_Ridgeline.pdf p.1"],
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$18.2M" },
      { rule: "State permitted", pass: true, hard: true, detail: "CO — allowed" },
      { rule: "Class code permitted", pass: true, hard: true, detail: "General contractor" },
      { rule: "5-year loss run provided", pass: false, hard: false, detail: "Only 2 years supplied" },
    ],
    activity: [
      { at: "08:11", who: "AI · Extraction Core", what: "Email ingested · 3 attachments", ctx: "Amwins Access", conf: "—" },
      { at: "08:52", who: "AI · Decision Core", what: "Recommended REQUEST_INFO", ctx: "2 required items missing", conf: "71%" },
    ],
  },

  "SUB-24015": {
    recommendation: "DECLINE",
    confidence: 0.88,
    hardRulePassed: false,
    failedRules: ["HR-03 · Sawmill / wood manufacturing is an excluded class"],
    processing: "ready",
    rulesVersion: "ACORD v3 · Combined v3",
    meta: { received: ["ACORD_125_Northwind.pdf", "Loss_Run.pdf"], lowConfidence: [], timestamp: "Yesterday · 16:20 ET" },
    docs: [
      { name: "ACORD_125_Northwind.pdf", kind: "ACORD 125", pages: 4, fields: 40, confidence: 0.96, classified: true },
      { name: "Loss_Run.pdf", kind: "Loss Run", pages: 5, fields: 30, confidence: 0.92, classified: true },
    ],
    fields: [
      { key: "named_insured", label: "Named insured", value: "Northwind Wood Products", required: true, confidence: 0.98, source: "ACORD 125 p.1" },
      { key: "class", label: "Class / NAICS", value: "Sawmill / wood manufacturing (321113)", required: true, confidence: 0.97, source: "ACORD 125 p.2" },
      { key: "state", label: "State", value: "OR", required: true, confidence: 0.99, source: "ACORD 125 p.1" },
      { key: "tiv", label: "TIV", value: "$27.5M", required: true, confidence: 0.93, source: "ACORD 125" },
    ],
    loss: { totalIncurred: "$1,240,000", totalPaid: "$980,000", openClaims: 3, years: 5, required: 5, trend: "worsening" },
    consistency: [
      { label: "Class code vs appetite", detail: "NAICS 321113 is on the excluded-class list", status: "fail" },
      { label: "Loss disclosure vs loss run", detail: "Consistent", status: "ok" },
    ],
    missingInfo: [],
    factors: [
      { name: "Excluded class", value: "Sawmill (hard exclusion)", weight: -100 },
      { name: "Loss history", value: "Worsening · 3 open claims", weight: -14 },
    ],
    narrative:
      "Northwind Wood Products falls outside appetite: sawmill / wood manufacturing (NAICS 321113) is an excluded class under hard rule HR-03. Historical loss cost on this class exceeds appetite by ~3.4x. This is a deterministic hard-rule decline — no risk-score judgment is applied. Overriding this decision requires Director-level approval with a written rationale.",
    citations: ["ACORD_125_Northwind.pdf p.2"],
    appetite: [
      { rule: "Class code permitted (no sawmill)", pass: false, hard: true, detail: "NAICS 321113 excluded — HR-03" },
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$27.5M" },
      { rule: "State permitted", pass: true, hard: true, detail: "OR — allowed" },
    ],
    activity: [
      { at: "16:18", who: "AI · Extraction Core", what: "Email ingested · 2 attachments", ctx: "Burns & Wilcox", conf: "—" },
      { at: "16:20", who: "AI · Decision Core", what: "Hard-rule fail → DECLINE", ctx: "HR-03 excluded class", conf: "88%" },
    ],
  },
};

const pad2 = (n: number) => String(n).padStart(2, "0");

// Fallback detail for any submission without an explicit record — keeps every
// row in the inbox clickable with sensible, PRD-shaped content.
function buildDefaultTriage(s: Submission): TriageDetail {
  const rec: TriageRecommendation =
    s.recommendation === "Proceed" ? "PROCEED" : s.recommendation === "Decline" ? "DECLINE" : "REQUEST_INFO";
  const hard = s.appetite !== "Out of appetite";
  const processing: ProcessingState = s.status === "Extracting" ? "extracting" : s.status === "New" ? "queued" : "ready";
  const conf = s.score > 0 ? Math.min(0.97, 0.6 + s.score / 250) : 0.6;
  return {
    recommendation: rec,
    confidence: conf,
    hardRulePassed: hard,
    failedRules: hard ? [] : ["HR · Risk falls outside current appetite"],
    processing,
    rulesVersion: "ACORD v3 · Combined v3",
    meta: { received: submissionDocs.slice(0, 3).map((d) => d.name), lowConfidence: [], timestamp: `Received ${s.received}` },
    docs: submissionDocs.slice(0, 4).map((d) => ({ name: d.name, kind: d.kind, pages: d.pages, fields: d.extractedFields, confidence: d.confidence, classified: true })),
    fields: [
      { key: "named_insured", label: "Named insured", value: s.insured, required: true, confidence: 0.97, source: "ACORD 125 p.1" },
      { key: "class", label: "Class / industry", value: s.industry, required: true, confidence: 0.94, source: "ACORD 125 p.2" },
      { key: "state", label: "State", value: s.state, required: true, confidence: 0.98, source: "ACORD 125 p.1" },
      { key: "effective", label: "Effective date", value: s.effective, required: true, confidence: 0.96, source: "ACORD 125 p.1" },
      { key: "tiv", label: "TIV", value: s.tiv, required: true, confidence: 0.93, source: "SOV" },
      { key: "premium", label: "Est. premium", value: s.premium, required: false, confidence: 0.9, source: "ACORD 125" },
    ],
    loss: { totalIncurred: "$412,000", totalPaid: "$280,000", openClaims: 1, years: 5, required: 5, trend: "flat" },
    consistency: [
      { label: "Revenue: ACORD vs financials", detail: "Within 5% tolerance", status: "ok" },
      { label: "TIV: ACORD 140 vs SOV", detail: "Reconciles", status: "ok" },
      { label: "Effective-date feasibility", detail: `Effective ${s.effective} — feasible`, status: "ok" },
    ],
    missingInfo:
      rec === "REQUEST_INFO"
        ? [{ item: "Updated loss run", reason: "Latest term not reflected in submitted run", severity: "required" }]
        : [],
    factors: [
      { name: "Loss history (5yr)", value: "Within appetite", weight: 10 },
      { name: "Class", value: s.industry, weight: hard ? 5 : -20 },
      { name: "Documentation", value: "Complete", weight: 6 },
    ],
    narrative: `${s.insured} is a ${s.industry} risk in ${s.state}. Decision Core recommends ${RECOMMENDATION_LABEL[rec]} at an estimated premium of ${s.premium}, grounded in the submitted ACORD application and loss run.`,
    citations: ["ACORD_125.pdf p.2", "Loss_Run.pdf p.4"],
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: `${s.tiv}` },
      { rule: "State permitted", pass: hard, hard: true, detail: s.state },
      { rule: "Class code permitted", pass: hard, hard: true, detail: s.industry },
      { rule: "Loss ratio 5yr < 55%", pass: s.score >= 60, hard: false, detail: "—" },
    ],
    activity: [
      { at: "09:00", who: "AI · Extraction Core", what: "Documents parsed & validated", ctx: `${submissionDocs.slice(0, 4).length} documents`, conf: "96%" },
      { at: "09:02", who: "AI · Decision Core", what: `Recommended ${rec}`, ctx: s.insured, conf: `${Math.round(conf * 100)}%` },
    ],
  };
}

export function getTriageDetail(s: Submission): TriageDetail {
  return explicitTriage[s.id] ?? buildDefaultTriage(s);
}

export function nowClock(): string {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/* ============================================================
   Renewal Management — PRD-aligned detail model.
   Appetite rules are the SAME shared set as Submission Triage
   (see AppetiteResult) — Renewal re-runs them against the
   *current* rule version and flags drift. The comparison /
   change-detection layer (below) is renewal-specific.
   Mock data only; shaped like the Renewal PRD's Section 7.2.
   ============================================================ */

export type RenewalRecommendation = "RENEW_AS_IS" | "RENEW_WITH_CHANGES" | "NON_RENEW";

export const RENEWAL_REC_LABEL: Record<RenewalRecommendation, string> = {
  RENEW_AS_IS: "Renew as-is",
  RENEW_WITH_CHANGES: "Renew with changes",
  NON_RENEW: "Non-renew",
};

export type ChangeCategory = "exposure" | "loss" | "appetite" | "timing" | "info";
export type Direction = "favorable" | "unfavorable" | "neutral";
export type PriorSource = "PAS" | "stored_triage_record" | "manual_queue";

export type CompareRow = {
  label: string;
  prior: string;
  current: string;
  change?: string;
  direction?: Direction;
  strong?: boolean;
};
export type ChangeFlag = { category: ChangeCategory; label: string; detail: string; direction: Direction };
export type LossChange = { type: "new_claim" | "status_change" | "favorable_closure" | "trend"; description: string; direction: Direction; source?: string };
export type RenewalChangeItem = { item: string; reason: string; source?: string };

export type RenewalDetail = {
  recommendation: RenewalRecommendation;
  confidence: number;
  processing: ProcessingState;
  priorSource: PriorSource;
  rulesVersion: string;
  rulesVersionAtBinding: string;
  hardRulePassed: boolean;
  appetite: AppetiteResult[];
  appetiteDrift?: string; // RN-10 call-out
  comparison: CompareRow[];
  changeFlags: ChangeFlag[];
  lossChanges: LossChange[];
  timing: { daysToExpiration: number; lapseRisk: boolean; noSubmission: boolean };
  changes: RenewalChangeItem[]; // "renew with changes" specifics
  narrative: string;
  citations: string[];
  broker: { name: string; agency: string; tenure: string; note: string };
  activity: ActivityEntry[];
};

const explicitRenewals: Record<string, RenewalDetail> = {
  "REN-24-4102": {
    recommendation: "RENEW_WITH_CHANGES",
    confidence: 0.9,
    processing: "ready",
    priorSource: "stored_triage_record",
    rulesVersion: "ACORD v3 · Combined v3",
    rulesVersionAtBinding: "ACORD v3",
    hardRulePassed: true,
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$42.8M" },
      { rule: "State permitted", pass: true, hard: true, detail: "FL" },
      { rule: "Class code permitted", pass: true, hard: true, detail: "Cold storage warehousing" },
      { rule: "Loss ratio 5yr < 55%", pass: true, hard: false, detail: "38%" },
      { rule: "Sprinklered ≥ 80% TIV", pass: true, hard: true, detail: "92%" },
    ],
    comparison: [
      { label: "Named insured", prior: "Palmetto Cold Storage LLC", current: "Palmetto Cold Storage LLC" },
      { label: "Locations", prior: "12", current: "14", change: "+2", direction: "unfavorable" },
      { label: "TIV", prior: "$38.4M", current: "$42.8M", change: "+11.5%", direction: "unfavorable" },
      { label: "Payroll", prior: "$4.2M", current: "$4.8M", change: "+14.3%", direction: "unfavorable" },
      { label: "Annual revenue", prior: "$36.9M", current: "$41.2M", change: "+11.7%", direction: "unfavorable" },
      { label: "Sprinklered TIV", prior: "88%", current: "92%", change: "+4pp", direction: "favorable" },
      { label: "Open claims", prior: "1", current: "1", direction: "neutral" },
      { label: "Indicated premium", prior: "$168,900", current: "$187,400", change: "+10.9%", direction: "unfavorable", strong: true },
    ],
    changeFlags: [
      { category: "exposure", label: "Revenue +11.7% / payroll +14.3%", detail: "Rate & limit adequacy review warranted (RN-01)", direction: "unfavorable" },
      { category: "exposure", label: "2 new refrigerated locations", detail: "Inspected Nov 2025 — no material findings", direction: "neutral" },
    ],
    lossChanges: [{ type: "trend", description: "Loss trend flat over the expiring term; 5yr LR steady at 38%", direction: "favorable", source: "Loss_Run_5yr.pdf" }],
    timing: { daysToExpiration: 31, lapseRisk: false, noSubmission: false },
    changes: [
      { item: "Rate / limit adequacy review", reason: "Stated revenue up 11.7% and payroll up 14.3% since prior term", source: "Financials FY24 · ACORD 125" },
      { item: "Spoilage sub-limit refresh to $500k", reason: "Broker request; consistent with expanded cold-storage exposure", source: "Broker email" },
      { item: "Refreshed sprinkler certification", reason: "Two new locations added since last inspection", source: "SOV" },
    ],
    narrative:
      "Payroll and revenue expansion (~+14% and +12%) plus two new refrigerated locations drive the indicated +10.9% rate change. Loss ratio remains excellent at 38%, sprinklered TIV improved to 92%. Account remains in appetite. Recommend renewal with a rate/limit review, a $500k spoilage sub-limit, and refreshed sprinkler certification.",
    citations: ["ACORD_125_Palmetto.pdf p.2", "Financials_FY24.pdf p.3", "Loss_Run_5yr.pdf p.4"],
    broker: { name: "Ana Ruiz", agency: "Marsh Southeast", tenure: "Broker for 4 years · 62 bound policies", note: "Insured is expanding into a third Jacksonville location. Would appreciate spoilage sub-limit confirmation and a 15-day extension if bind slips past Feb 12." },
    activity: [
      { at: "08:40", who: "AI · Extraction Core", what: "Renewal documents parsed", ctx: "prior term from stored triage record", conf: "96%" },
      { at: "08:41", who: "AI · Decision Core", what: "Recommended RENEW_WITH_CHANGES", ctx: "exposure growth review", conf: "90%" },
    ],
  },

  "REN-24-4101": {
    recommendation: "RENEW_WITH_CHANGES",
    confidence: 0.82,
    processing: "ready",
    priorSource: "PAS",
    rulesVersion: "ACORD v3 · Combined v3",
    rulesVersionAtBinding: "ACORD v2",
    hardRulePassed: true,
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$88.0M" },
      { rule: "State permitted", pass: false, hard: false, detail: "New state AZ — licensing check required" },
      { rule: "Class code permitted", pass: true, hard: true, detail: "Hotels / restaurants" },
      { rule: "Loss ratio 5yr < 55%", pass: true, hard: false, detail: "42%" },
    ],
    comparison: [
      { label: "Named insured", prior: "Highline Hospitality Group", current: "Highline Hospitality Group" },
      { label: "Locations", prior: "3", current: "4", change: "+1 · Scottsdale AZ", direction: "unfavorable" },
      { label: "States of operation", prior: "NV", current: "NV, AZ", change: "+AZ", direction: "unfavorable" },
      { label: "TIV", prior: "$74.5M", current: "$88.0M", change: "+18.1%", direction: "unfavorable" },
      { label: "Open claims", prior: "2", current: "2", direction: "neutral" },
      { label: "Indicated premium", prior: "$388,200", current: "$421,000", change: "+8.4%", direction: "unfavorable", strong: true },
    ],
    changeFlags: [
      { category: "exposure", label: "New location + new state (AZ)", detail: "State-licensing / appetite check required before renewal (RN-04)", direction: "unfavorable" },
      { category: "timing", label: "Lapse risk — 4 days to expiration", detail: "Renewal submission arrived late; expedite to avoid coverage gap (RN-11)", direction: "unfavorable" },
    ],
    lossChanges: [{ type: "trend", description: "Loss ratio steady at 42%; no new large losses in the expiring term", direction: "neutral" }],
    timing: { daysToExpiration: 4, lapseRisk: true, noSubmission: false },
    changes: [
      { item: "Confirm AZ licensing / appetite for new location", reason: "New state of operation added since prior term", source: "Renewal questionnaire" },
      { item: "Expedite bind — lapse risk", reason: "Only 4 business days to expiration", source: "Timing check" },
    ],
    narrative:
      "Highline added a fourth location in Scottsdale AZ — a new state of operation that requires a licensing/appetite check before renewal (RN-04). Loss ratio is stable at 42%. Submission arrived close to expiration, creating lapse risk (RN-11). Recommend renewal with changes once the AZ check clears; expedite to avoid a coverage gap.",
    citations: ["Renewal_Questionnaire.pdf p.1", "Loss_Run.pdf p.2"],
    broker: { name: "Jordan Blake", agency: "RT Specialty", tenure: "Broker for 2 years · 39 bound policies", note: "New Scottsdale property opens in March. Can we confirm terms this week — the current policy expires Feb 20." },
    activity: [
      { at: "09:02", who: "AI · Decision Core", what: "Flagged new-state exposure + lapse risk", ctx: "AZ licensing check", conf: "82%" },
    ],
  },

  "REN-24-4100": {
    recommendation: "RENEW_AS_IS",
    confidence: 0.95,
    processing: "ready",
    priorSource: "PAS",
    rulesVersion: "ACORD v3 · Combined v3",
    rulesVersionAtBinding: "ACORD v3",
    hardRulePassed: true,
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$22.1M" },
      { rule: "State permitted", pass: true, hard: true, detail: "PA" },
      { rule: "Class code permitted", pass: true, hard: true, detail: "Senior care" },
      { rule: "Loss ratio 5yr < 55%", pass: true, hard: false, detail: "29%" },
    ],
    comparison: [
      { label: "Named insured", prior: "Cedar Grove Assisted Living", current: "Cedar Grove Assisted Living" },
      { label: "Locations", prior: "2", current: "2", direction: "neutral" },
      { label: "TIV", prior: "$21.4M", current: "$22.1M", change: "+3.3%", direction: "neutral" },
      { label: "Annual revenue", prior: "$18.9M", current: "$19.4M", change: "+2.6%", direction: "neutral" },
      { label: "Open claims", prior: "0", current: "0", direction: "favorable" },
      { label: "Indicated premium", prior: "$112,700", current: "$118,400", change: "+5.1%", direction: "neutral", strong: true },
    ],
    changeFlags: [],
    lossChanges: [{ type: "trend", description: "Clean loss history — 5yr LR 29%, no open claims", direction: "favorable" }],
    timing: { daysToExpiration: 57, lapseRisk: false, noSubmission: false },
    changes: [],
    narrative:
      "Cedar Grove is a clean senior-care renewal: no material exposure change, no new claims, 5-year loss ratio of 29%, and no appetite issues. The +5.1% indicated reflects standard trend only. Recommend renewing as-is.",
    citations: ["Renewal_Questionnaire.pdf p.1", "Loss_Run.pdf p.3"],
    broker: { name: "Emma O'Neill", agency: "Risk Placement Svcs.", tenure: "Broker for 6 years · 41 bound policies", note: "No changes this year — please renew on the same terms." },
    activity: [{ at: "09:28", who: "AI · Decision Core", what: "Recommended RENEW_AS_IS", ctx: "clean — no material change", conf: "95%" }],
  },

  "REN-24-4099": {
    recommendation: "NON_RENEW",
    confidence: 0.88,
    processing: "ready",
    priorSource: "PAS",
    rulesVersion: "ACORD v3 · Combined v3",
    rulesVersionAtBinding: "ACORD v1",
    hardRulePassed: false,
    appetite: [
      { rule: "Class code permitted", pass: false, hard: true, detail: "Reclassified class code now on excluded list (HR-03)" },
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$18.2M" },
      { rule: "State permitted", pass: true, hard: true, detail: "CO" },
      { rule: "Loss ratio 5yr < 55%", pass: false, hard: false, detail: "44% — elevated vs class" },
    ],
    appetiteDrift:
      "Bound in appetite under rules v1 (Nov 2024). The account's class code was reclassified and is excluded under current rules v3 — the account itself did not change, the appetite rules did (RN-10). This must be stated explicitly and non-judgmentally in broker communication.",
    comparison: [
      { label: "Named insured", prior: "Ridgeline Contractors, Inc.", current: "Ridgeline Contractors, Inc." },
      { label: "Class code", prior: "GC — general (in appetite v1)", current: "GC — excavation/grading (excluded v3)", change: "reclassified", direction: "unfavorable" },
      { label: "5yr loss ratio", prior: "31%", current: "44%", change: "+13pp", direction: "unfavorable" },
      { label: "Open claims", prior: "1", current: "2", change: "+1 new", direction: "unfavorable" },
      { label: "Indicated premium", prior: "$91,400", current: "$96,200", change: "+5.3%", direction: "neutral", strong: true },
    ],
    changeFlags: [
      { category: "appetite", label: "Appetite drift — class now excluded", detail: "Hard-rule fail under current rules v3 (HR-03)", direction: "unfavorable" },
      { category: "loss", label: "New claim in expiring term", detail: "Loss ratio up 13pp; 1 new open claim (RN-06)", direction: "unfavorable" },
    ],
    lossChanges: [
      { type: "new_claim", description: "One new claim opened in the expiring term ($64k incurred)", direction: "unfavorable", source: "Loss_Run.pdf p.1" },
      { type: "trend", description: "Loss ratio deteriorated from 31% to 44%", direction: "unfavorable" },
    ],
    timing: { daysToExpiration: 48, lapseRisk: false, noSubmission: false },
    changes: [],
    narrative:
      "Ridgeline no longer meets appetite: its class code was reclassified to excavation/grading, which is excluded under current rules v3 (HR-03) — a hard-rule fail. This is appetite drift, not account misconduct: it was in appetite at binding under rules v1. Loss experience has also deteriorated (44% vs 31%). Recommend non-renewal, framed as an appetite-rule change, with a compliance-reviewed notice.",
    citations: ["Renewal_Questionnaire.pdf p.2", "Loss_Run.pdf p.1"],
    broker: { name: "Michael Chen", agency: "Amwins Access", tenure: "Broker for 3 years · 51 bound policies", note: "Any flexibility on the Ridgeline renewal? They've been with us three years." },
    activity: [
      { at: "09:11", who: "AI · Decision Core", what: "Hard-rule fail (current rules) → NON_RENEW", ctx: "class excluded under v3 · appetite drift", conf: "88%" },
    ],
  },

  "REN-24-4098": {
    recommendation: "RENEW_WITH_CHANGES",
    confidence: 0.91,
    processing: "ready",
    priorSource: "PAS",
    rulesVersion: "ACORD v3 · Combined v3",
    rulesVersionAtBinding: "ACORD v3",
    hardRulePassed: true,
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: "$134.9M" },
      { rule: "State permitted", pass: true, hard: true, detail: "VA" },
      { rule: "Class code permitted", pass: true, hard: true, detail: "Data center" },
      { rule: "Loss ratio 5yr < 55%", pass: true, hard: false, detail: "12% — excellent" },
    ],
    comparison: [
      { label: "Named insured", prior: "Copperline Data Center Ops", current: "Copperline Data Center Ops" },
      { label: "TIV", prior: "$128.0M", current: "$134.9M", change: "+5.4%", direction: "neutral" },
      { label: "Cyber sub-limit", prior: "$5M", current: "$10M (requested)", change: "+$5M", direction: "unfavorable" },
      { label: "Open claims", prior: "1", current: "0", change: "closed", direction: "favorable" },
      { label: "Indicated premium", prior: "$584,100", current: "$612,300", change: "+4.8%", direction: "neutral", strong: true },
    ],
    changeFlags: [
      { category: "loss", label: "Favorable claim resolution", detail: "$220k reserved claim closed at $60k paid — 73% under reserve (RN-07)", direction: "favorable" },
      { category: "exposure", label: "Cyber sub-limit increase requested", detail: "$5M → $10M — coverage change, review pricing", direction: "neutral" },
    ],
    lossChanges: [
      { type: "favorable_closure", description: "Prior open claim ($220k reserve) closed at $60k paid — 73% under reserve", direction: "favorable", source: "Loss_Run.pdf p.2" },
      { type: "trend", description: "Loss ratio improving — 12%, best in class", direction: "favorable" },
    ],
    timing: { daysToExpiration: 47, lapseRisk: false, noSubmission: false },
    changes: [{ item: "Cyber sub-limit increase to $10M", reason: "Broker request; price the additional $5M of cyber limit", source: "Renewal questionnaire" }],
    narrative:
      "Copperline is a strong, improving renewal: 5-year loss ratio of 12% and a prior open claim that closed 73% under reserve — a favorable signal, candidate for improved terms. The only change is a requested cyber sub-limit increase to $10M, which needs pricing. Recommend renewal with that single change.",
    citations: ["Renewal_Questionnaire.pdf p.1", "Loss_Run.pdf p.2"],
    broker: { name: "Diego Fernandes", agency: "AmWINS Brokerage", tenure: "Broker for 5 years · 44 bound policies", note: "Client wants to double the cyber sub-limit to $10M this term. Everything else stays the same." },
    activity: [{ at: "08:55", who: "AI · Decision Core", what: "Recommended RENEW_WITH_CHANGES", ctx: "favorable — cyber sub-limit change only", conf: "91%" }],
  },
};

export type Renewal = (typeof renewals)[number];

function buildDefaultRenewal(r: Renewal): RenewalDetail {
  const rec: RenewalRecommendation = r.flag === "Clean" ? "RENEW_AS_IS" : "RENEW_WITH_CHANGES";
  return {
    recommendation: rec,
    confidence: 0.88,
    processing: "ready",
    priorSource: "PAS",
    rulesVersion: "ACORD v3 · Combined v3",
    rulesVersionAtBinding: "ACORD v3",
    hardRulePassed: true,
    appetite: [
      { rule: "TIV under $250M", pass: true, hard: true, detail: "within limit" },
      { rule: "Class code permitted", pass: true, hard: true, detail: "in appetite" },
      { rule: "Loss ratio 5yr < 55%", pass: true, hard: false, detail: r.lossRatio },
    ],
    comparison: [
      { label: "Named insured", prior: r.insured, current: r.insured },
      { label: "Indicated premium", prior: r.priorPremium, current: r.indicated, change: r.change, direction: "unfavorable", strong: true },
    ],
    changeFlags: r.flag === "Clean" ? [] : [{ category: "exposure", label: r.flag, detail: "Flagged for review", direction: "unfavorable" }],
    lossChanges: [{ type: "trend", description: `5yr loss ratio ${r.lossRatio}`, direction: "neutral" }],
    timing: { daysToExpiration: 45, lapseRisk: false, noSubmission: false },
    changes: rec === "RENEW_WITH_CHANGES" ? [{ item: r.flag, reason: "Change noted on the renewal submission" }] : [],
    narrative: `${r.insured} renews at an indicated ${r.change}. ${r.flag === "Clean" ? "No material changes — recommend renewing as-is." : `Change noted: ${r.flag}. Recommend renewal with changes.`}`,
    citations: ["Renewal_Questionnaire.pdf p.1"],
    broker: { name: "Broker", agency: "—", tenure: "—", note: "" },
    activity: [{ at: "09:00", who: "AI · Decision Core", what: `Recommended ${rec}`, ctx: r.insured, conf: "88%" }],
  };
}

export function getRenewalDetail(r: Renewal): RenewalDetail {
  return explicitRenewals[r.id] ?? buildDefaultRenewal(r);
}

/* ============================================================
   Broker Communication — PRD-aligned draft model.
   No new extraction: every draft is generated FROM a Submission
   Triage or Renewal Management decision record. Mock data only,
   shaped like the Broker Communication PRD's §7.1.
   ============================================================ */

export type CommType =
  | "MISSING_INFO_REQUEST"
  | "CONSISTENCY_FLAG_FOLLOWUP"
  | "QUOTE_SUMMARY"
  | "RENEWAL_TERMS_EXPLANATION"
  | "NON_RENEWAL_NOTICE"
  | "NO_RESPONSE_FOLLOWUP";

export const COMM_TYPE_LABEL: Record<CommType, string> = {
  MISSING_INFO_REQUEST: "Missing-info request",
  CONSISTENCY_FLAG_FOLLOWUP: "Consistency-flag follow-up",
  QUOTE_SUMMARY: "Quote summary",
  RENEWAL_TERMS_EXPLANATION: "Renewal-terms explanation",
  NON_RENEWAL_NOTICE: "Non-renewal notice",
  NO_RESPONSE_FOLLOWUP: "No-response follow-up",
};

export type CommStatus = "DRAFT" | "UNDER_COMPLIANCE_REVIEW" | "APPROVED" | "SENT" | "DISCARDED";
export type VolumeTier = "low" | "moderate" | "high" | "strategic";

export type BrokerContext = {
  name: string;
  agency: string;
  email: string;
  tenureYears: number | null; // null => unknown → neutral default tone
  volumeTier: VolumeTier | null;
};

export type CommDraft = {
  id: string;
  type: CommType;
  sourceWorkflow: "Submission Triage" | "Renewal Management";
  sourceId: string;
  sourceRoute: string;
  namedInsured: string;
  broker: BrokerContext;
  subject: string;
  tone: string;
  toneWhy: string; // why this tone (type + relationship)
  sensitive: boolean;
  requiresComplianceReview: boolean;
  combined?: string; // note if it merges >1 trigger (FR-5)
  deadlineRef?: string; // for follow-ups (anchor urgency to a real date)
  citations: { claim: string; source: string }[];
  body: string;
  status: CommStatus;
  generatedAt: string;
};

export const communicationQueue: CommDraft[] = [
  {
    id: "DRF-3011",
    type: "MISSING_INFO_REQUEST",
    sourceWorkflow: "Submission Triage",
    sourceId: "SUB-24018",
    sourceRoute: "/app/workflows/submission-triage",
    namedInsured: "Ridgeline Contractors, Inc.",
    broker: { name: "Michael Chen", agency: "Amwins Access", email: "michael.chen@amwins.com", tenureYears: 3, volumeTier: "moderate" },
    subject: "Ridgeline Contractors — a couple of items to complete our review",
    tone: "Collaborative",
    toneWhy: "Routine request · 3-year moderate-volume relationship → warm but efficient",
    sensitive: false,
    requiresComplianceReview: false,
    combined: "Missing info + loss-run depth flag",
    citations: [
      { claim: "Current SOV required", source: "Appetite rule · ACORD v3" },
      { claim: "5-year loss run required", source: "Loss_Run_Ridgeline.pdf" },
    ],
    body: `Hi Michael,

Thanks for the submission on Ridgeline Contractors. To finish our review we just need a couple of items:

1. A current Statement of Values (SOV) — we didn't see one attached.
2. The full 5-year loss run — the run we have covers 2024–2025, and we want to make sure we have the complete picture.

As soon as those come through we can turn terms around quickly. Happy to hop on a call if that's easier.

Best,
Priya`,
    status: "DRAFT",
    generatedAt: "Today · 08:53",
  },
  {
    id: "DRF-3012",
    type: "CONSISTENCY_FLAG_FOLLOWUP",
    sourceWorkflow: "Submission Triage",
    sourceId: "SUB-24019",
    sourceRoute: "/app/workflows/submission-triage",
    namedInsured: "Palmetto Cold Storage LLC",
    broker: { name: "Ana Ruiz", agency: "Marsh Southeast", email: "ana.ruiz@marsh.com", tenureYears: 4, volumeTier: "strategic" },
    subject: "Palmetto Cold Storage — quick check on the sprinkler figures",
    tone: "Careful",
    toneWhy: "Sensitive category · strategic relationship → neutral framing, offer a call (TN-07)",
    sensitive: true,
    requiresComplianceReview: false,
    citations: [
      { claim: "SOV lists 92% sprinklered", source: "Palmetto_SOV_2026.xlsx" },
      { claim: "Prior inspection noted 88%", source: "Inspection report 2025" },
    ],
    body: `Hi Ana,

Quick one on Palmetto — we want to make sure we have a complete picture before we finalize. The SOV lists sprinklered TIV at 92%, and the prior inspection on file noted 88%. Could you help us confirm the current figure, especially for the two new Jacksonville locations?

No concern at all — just want the file to line up. Happy to jump on a quick call if that's easier than email.

Best,
Priya`,
    status: "DRAFT",
    generatedAt: "Today · 09:44",
  },
  {
    id: "DRF-3013",
    type: "QUOTE_SUMMARY",
    sourceWorkflow: "Submission Triage",
    sourceId: "SUB-24012",
    sourceRoute: "/app/workflows/submission-triage",
    namedInsured: "Copperline Data Center Ops",
    broker: { name: "Diego Fernandes", agency: "AmWINS Brokerage", email: "diego.f@amwins.com", tenureYears: 5, volumeTier: "high" },
    subject: "Copperline Data Center — indicated terms",
    tone: "Positive",
    toneWhy: "Good news · lead with outcome, terms as a scannable list, no internal risk detail (TN-15)",
    sensitive: false,
    requiresComplianceReview: false,
    citations: [{ claim: "Indicated premium $612,300", source: "Quote · SUB-24012" }],
    body: `Hi Diego,

Good news on Copperline Data Center — we're able to offer terms. Summary:

• Premium: $612,300
• Property + Cyber, TIV $134.9M
• Effective: 02/28/2026
• Cyber sub-limit: $5M (increase options available)

Full proposal attached. Let me know if you'd like to walk through anything.

Best,
Priya`,
    status: "DRAFT",
    generatedAt: "Today · 09:20",
  },
  {
    id: "DRF-3014",
    type: "RENEWAL_TERMS_EXPLANATION",
    sourceWorkflow: "Renewal Management",
    sourceId: "REN-24-4102",
    sourceRoute: "/app/workflows/renewal-management",
    namedInsured: "Palmetto Cold Storage LLC",
    broker: { name: "Ana Ruiz", agency: "Marsh Southeast", email: "ana.ruiz@marsh.com", tenureYears: 4, volumeTier: "strategic" },
    subject: "Palmetto Cold Storage — renewal terms",
    tone: "Warm",
    toneWhy: "Growth-driven changes → frame as good news requiring coordination, group changes coherently (TN-12/14)",
    sensitive: false,
    requiresComplianceReview: false,
    citations: [
      { claim: "Revenue +11.7%, payroll +14.3%", source: "Financials FY24 · ACORD 125" },
      { claim: "Indicated +10.9%", source: "Renewal quote" },
    ],
    body: `Hi Ana,

Great to see Palmetto growing — two new refrigerated locations and revenue up ~12% since last term. That growth is the main driver of the renewal, so a few things to coordinate rather than anything to worry about:

• Indicated premium: $187,400 (+10.9%), reflecting the added exposure
• $500k spoilage sub-limit, as requested
• Refreshed sprinkler certification for the new locations

Loss experience remains strong. Full terms attached — happy to talk it through.

Best,
Priya`,
    status: "DRAFT",
    generatedAt: "Today · 08:42",
  },
  {
    id: "DRF-3015",
    type: "NON_RENEWAL_NOTICE",
    sourceWorkflow: "Renewal Management",
    sourceId: "REN-24-4099",
    sourceRoute: "/app/workflows/renewal-management",
    namedInsured: "Ridgeline Contractors, Inc.",
    broker: { name: "Michael Chen", agency: "Amwins Access", email: "michael.chen@amwins.com", tenureYears: 3, volumeTier: "moderate" },
    subject: "Ridgeline Contractors — renewal",
    tone: "Considerate",
    toneWhy: "Appetite-drift non-renewal → lead with notice & help, state it's not a reflection of the account, no loss figures (TN-08/09/10)",
    sensitive: true,
    requiresComplianceReview: true,
    citations: [{ claim: "Class excluded under current appetite", source: "Rules Console · ACORD v3" }],
    body: `Hi Michael,

I wanted to give you as much notice as possible on the Ridgeline Contractors renewal. After our review, we won't be able to offer renewal terms this term.

I want to be clear this isn't a reflection of Ridgeline — our underwriting appetite for this class has changed since the policy was originally bound. The account itself is in good standing with us.

We'd be glad to help with the transition and to look at the rest of what you're placing. Happy to talk this through by phone whenever works.

Best,
Priya`,
    status: "UNDER_COMPLIANCE_REVIEW",
    generatedAt: "Today · 09:12",
  },
  {
    id: "DRF-3016",
    type: "NO_RESPONSE_FOLLOWUP",
    sourceWorkflow: "Renewal Management",
    sourceId: "REN-24-4101",
    sourceRoute: "/app/workflows/renewal-management",
    namedInsured: "Highline Hospitality Group",
    broker: { name: "Jordan Blake", agency: "RT Specialty", email: "jordan.blake@rtspecialty.com", tenureYears: 2, volumeTier: "moderate" },
    subject: "Re: Highline Hospitality — renewal (following up)",
    tone: "Gentle",
    toneWhy: "No reply in 7 business days → assume good faith, anchor to the real deadline, one follow-up only (TN-16/17)",
    sensitive: false,
    requiresComplianceReview: false,
    deadlineRef: "Policy expires Feb 20, 2026",
    citations: [{ claim: "Renewal terms sent Jan 9", source: "Thread history" }],
    body: `Hi Jordan,

Just circling back on the Highline Hospitality renewal — wanted to make sure our terms didn't get lost in the shuffle. With the policy expiring Feb 20, we'd love to get this wrapped up in good time so there's no gap for the insured.

Anything you need from us to move it forward? Happy to help.

Best,
Priya`,
    status: "DRAFT",
    generatedAt: "Today · 10:05",
  },
];
