/* ============================================================
   Appetite Governance & Audit Trail — API client.
   Talks to the real backend (Backend-AI-OS) at
   /api/mga/appetite-governance/*. Scoped to this one workflow
   only — no other screen imports this file, and no other screen
   is affected if the backend is unreachable: every call here is
   wrapped by the caller in a try/catch that falls back to the
   existing mock decision log (mocks.ts, untouched).

   Auth is the backend's Phase-0 header stub (x-tenant-id /
   x-user-id / x-role) — there is no real login yet on either
   side, so this maps the existing `useRole()` prototype role
   onto the seeded demo-mga junior/senior users.
   ============================================================ */

import type { Role } from "@/components/app/role";

const BASE_URL = import.meta.env.VITE_MGA_API_BASE_URL ?? "http://localhost:4000/api/mga";

const TENANT_ID = "demo-mga";

export type DecisionRecordDTO = {
  workflow: string;
  recordId: string;
  decision: string;
  rulesVersionApplied: string;
  underwriter: string;
};
export type GapDTO = { workflow: string; dateRange: string; reason: string };
export type DecisionTrailDTO = { status: string; gaps: GapDTO[]; decisions: DecisionRecordDTO[] };
export type RuleVersionDriftFindingDTO = {
  policyNumber: string;
  insured: string;
  boundUnderVersion: string;
  currentVersion: string;
  stillQualifies: boolean;
  detail: string;
};
export type OverridePatternFindingDTO = {
  underwriter: string;
  overrideCount: number;
  undocumentedCount: number;
  flagged: boolean;
  suggestion: string | null;
};
export type PortfolioConcentrationFindingDTO = {
  classCode: string;
  carrier: string;
  accountsNearCeiling: number;
  totalAccountsInSegment: number;
  lowVolumeFlag: boolean;
  detail: string;
};
export type GovernanceSuggestionDTO = {
  findingId: string;
  findingType: string;
  status: string;
  summary: string;
};
export type AuditReportDTO = {
  reportType: string;
  carrierName: string;
  period: string;
  triageDecisions: number;
  renewalDecisions: number;
  bindDecisions: number;
  endorsementDecisions: number;
  authorityCeilingBreachesReferred: number;
  authorityCeilingBreachesApproved: number;
  authorityCeilingBreachesDeclined: number;
  groundingStatement: string;
};

export type GovernanceDetailDTO = {
  auditPeriodId: string;
  period: string;
  decisionTrail: DecisionTrailDTO;
  ruleVersionDriftFindings: RuleVersionDriftFindingDTO[];
  overridePatternFindings: OverridePatternFindingDTO[];
  portfolioConcentrationFindings: PortfolioConcentrationFindingDTO[];
  governanceSuggestionQueue: GovernanceSuggestionDTO[];
  auditReport: AuditReportDTO | null;
  status: string;
  rationale: string;
  activity: { at: string; who: string; what: string; ctx?: string | null; conf?: string | null }[];
};

export type GovernanceRowDTO = { id: string; period: string; status: string; findingCount: number };

function headers(role: Role): HeadersInit {
  return {
    "content-type": "application/json",
    "x-tenant-id": TENANT_ID,
    "x-user-id": `${TENANT_ID}-${role}`,
    "x-role": role,
  };
}

async function request<T>(path: string, role: Role, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/appetite-governance${path}`, {
    ...init,
    headers: { ...headers(role), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`appetite-governance API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function listAudits(role: Role): Promise<GovernanceRowDTO[]> {
  return request<GovernanceRowDTO[]>("", role);
}

export function getAudit(role: Role, submissionId: string): Promise<GovernanceDetailDTO> {
  return request<GovernanceDetailDTO>(`/${submissionId}`, role);
}

export function runScenario(role: Role, scenario: string): Promise<GovernanceDetailDTO> {
  return request<GovernanceDetailDTO>(`/run?scenario=${encodeURIComponent(scenario)}`, role, {
    method: "POST",
  });
}

export function actOnAudit(
  role: Role,
  submissionId: string,
  action: "approve" | "send" | "escalate",
): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>(`/${submissionId}/act`, role, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
