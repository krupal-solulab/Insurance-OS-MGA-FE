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
