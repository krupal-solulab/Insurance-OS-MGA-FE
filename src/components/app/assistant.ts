/* ============================================================
   AI Assistant — canned response map (NO backend).
   This is the single seam a real LLM call replaces later:
   swap `answer()` for a Claude call with the user's book data
   as retrieval context. The citations/action-routing shape
   carries straight over.
   ============================================================ */

export type AssistantAction = { label: string; to: string };
export type AssistantAnswer = { blocks: string[]; citations: string[]; actions: AssistantAction[] };

const R = {
  triage: "/app/workflows/submission-triage",
  renewal: "/app/workflows/renewal-management",
  broker: "/app/workflows/broker-copilot",
  quoting: "/app/workflows/quoting",
  bordereau: "/app/workflows/bordereau",
  portfolio: "/app/workflows/portfolio",
};

type Canned = { match: string[]; answer: AssistantAnswer };

const CANNED: Canned[] = [
  {
    match: ["sub-24019", "palmetto"],
    answer: {
      blocks: [
        "SUB-24019 · Palmetto Cold Storage LLC — FL warehousing risk brokered by Marsh Southeast. TIV $42.8M across 14 locations, 92% sprinklered. Five-year loss ratio 38%. One open flood claim ($180k reserve, within appetite). Risk score 82 · Decision Core recommends Proceed at $187,400 premium.",
        "Nothing critical is missing. Two optional items would strengthen the file: a fresh sprinkler inspection for the two new Jacksonville locations, and a continuous refrigeration monitoring certification.",
      ],
      citations: ["ACORD_125_Palmetto.pdf p.2", "Loss_Run_5yr.pdf p.4", "Palmetto_SOV_2026.xlsx"],
      actions: [
        { label: "Open submission", to: R.triage },
        { label: "Draft chase email", to: R.broker },
      ],
    },
  },
  {
    match: ["ridgeline", "appetite decision"],
    answer: {
      blocks: [
        "Ridgeline Contractors (SUB-24018) is marginal. It's within class appetite, but the submission is incomplete — no SOV and only 2 years of loss history (5 required) — and the 2-year loss trend is worsening with 2 open claims.",
        "Decision Core recommends Request Info before scoring: obtain the current SOV and the full 5-year loss run. A decision can't be made on the current record.",
      ],
      citations: ["ACORD_125_Ridgeline.pdf p.2", "Loss_Run_Ridgeline.pdf p.1"],
      actions: [
        { label: "Open submission", to: R.triage },
        { label: "Draft request-info email", to: R.broker },
      ],
    },
  },
  {
    match: ["compare palmetto renewal", "renewal with prior", "palmetto renewal"],
    answer: {
      blocks: [
        "Palmetto renewal (REN-24-4102): revenue +11.7% and payroll +14.3% since the prior term, plus two new refrigerated locations — driving the indicated +10.9% ($168,900 → $187,400). Loss ratio steady at 38%; sprinklered TIV improved 88% → 92%.",
        "Account remains in appetite. Recommendation: Renew with changes — a rate/limit review, a $500k spoilage sub-limit, and refreshed sprinkler certification.",
      ],
      citations: ["Financials_FY24.pdf p.3", "Renewal quote"],
      actions: [{ label: "Open renewal", to: R.renewal }],
    },
  },
  {
    match: ["missing sov", "broker email requesting", "draft a broker"],
    answer: {
      blocks: [
        "Drafted a missing-info request to Michael Chen (Amwins) for Ridgeline Contractors, asking for the current SOV and the full 5-year loss run — combined into one email, grounded in the submission.",
        "It's in the Broker Copilot review queue. Nothing sends until you approve it.",
      ],
      citations: ["Appetite rule · ACORD v3", "Loss_Run_Ridgeline.pdf"],
      actions: [{ label: "Review draft in Broker Copilot", to: R.broker }],
    },
  },
  {
    match: ["copperline", "pricing"],
    answer: {
      blocks: [
        "Copperline Data Center (SUB-24012) — indicated premium $612,300 for Property + Cyber, TIV $134.9M. Strong risk: 5-year loss ratio 12%, and a prior open claim closed 73% under reserve.",
        "The renewal request is a cyber sub-limit increase to $10M, which needs pricing. Otherwise terms hold.",
      ],
      citations: ["Quote · SUB-24012", "Loss_Run.pdf p.2"],
      actions: [{ label: "Open quoting", to: R.quoting }],
    },
  },
  {
    match: ["deductible", "highline"],
    answer: {
      blocks: [
        "Highline Hospitality — at the current $25k deductible the indicated is $421,000 with a projected 41% loss ratio. Moving to a $50k deductible would reduce premium ~6% with minimal loss-ratio impact given the clean recent history.",
        "Recommendation: offer both the $25k and $50k options so the broker can choose.",
      ],
      citations: ["Loss_Run.pdf", "Rating model"],
      actions: [{ label: "Open quoting", to: R.quoting }],
    },
  },
  {
    match: ["missing documents", "sub-24017", "bayou"],
    answer: {
      blocks: [
        "SUB-24017 · Bayou Marine Services is still extracting. From what's parsed so far, the marine schedule and a current SOV are outstanding, and the loss run appears to cover only 3 of the required 5 years.",
        "I'll finalize the missing-info list once extraction completes — then you can send a single request to the broker.",
      ],
      citations: ["Broker_Cover_Email.eml", "partial extraction"],
      actions: [{ label: "Open submission", to: R.triage }],
    },
  },
  {
    match: ["bordereau", "carrier a"],
    answer: {
      blocks: [
        "Carrier A January premium bordereau: 213 of 214 transactions compiled. One bound policy is missing — COV-24-P-00741 (Ridgeline), an endorsement bound mid-period that wasn't in the extract.",
        "The bordereau is Blocked on the completeness check — add the missing transaction before it can be generated or submitted.",
      ],
      citations: ["PAS transaction universe", "Bordereau profile · Carrier A"],
      actions: [{ label: "Open Bordereau Reporting", to: R.bordereau }],
    },
  },
  {
    match: ["portfolio", "exec review", "board"],
    answer: {
      blocks: [
        "January book: bound premium $48.2M YTD (+14% YoY), hit ratio 38.4%, loss ratio 41.6% (plan 45%), renewal retention 92%. Marsh Southeast is the strongest growth channel.",
        "Watch item: FL warehousing rate adequacy is drifting ~8pp above plan on loss ratio — worth a pricing note for the review.",
      ],
      citations: ["Portfolio · YTD", "Decision Core insight"],
      actions: [{ label: "Open portfolio", to: R.portfolio }],
    },
  },
];

const FALLBACK: AssistantAnswer = {
  blocks: [
    "I can pull that together from your book. In this prototype I can summarize a submission (try SUB-24019), explain an appetite or renewal decision, draft a broker email, explain pricing, identify missing documents, compile a bordereau, or summarize the portfolio.",
    "Everything I surface is cited to source, and I hand off to the relevant workflow for you to approve — I don't act on my own.",
  ],
  citations: [],
  actions: [
    { label: "Open Submission Triage", to: R.triage },
    { label: "Open Portfolio", to: R.portfolio },
  ],
};

export function answer(query: string): AssistantAnswer {
  const q = query.toLowerCase();
  for (const c of CANNED) if (c.match.some((m) => q.includes(m))) return c.answer;
  return FALLBACK;
}
