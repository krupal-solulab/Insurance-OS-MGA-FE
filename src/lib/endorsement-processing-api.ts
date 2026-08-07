/* ============================================================
   Endorsement / Mid-Term Change Processing — API client.
   Talks to the real backend (Backend-AI-OS) at
   /api/mga/endorsement-processing/*. Scoped to this one workflow
   only — no other screen imports this file, and no other screen
   is affected if the backend is unreachable: every call here is
   wrapped by the caller in a try/catch that falls back to the
   existing mock queue (mocks.ts, untouched).

   Auth is the backend's Phase-0 header stub (x-tenant-id /
   x-user-id / x-role) — there is no real login yet on either
   side, so this maps the existing `useRole()` prototype role
   onto the seeded demo-mga junior/senior users.
   ============================================================ */

import type { Role } from "@/components/app/role";

const BASE_URL = import.meta.env.VITE_MGA_API_BASE_URL ?? "http://localhost:4000/api/mga";

const TENANT_ID = "demo-mga";

export type EndDiffRowDTO = { label: string; before: string; after: string; direction: string };
export type EndAppetiteDTO = { rule: string; pass: boolean; hard: boolean; detail: string };
export type AuthorityCheckDTO = {
  outcome: string;
  delegatedCeiling: string;
  resultingTotalPremium: string | null;
  excludedClassMatched: string | null;
};
export type CarrierReferralDTO = {
  drafted: boolean;
  carrierResponse: string | null;
  draftText: string | null;
};
export type WriteBackRecordDTO = {
  logged: boolean;
  bordereauSchemaValidated: boolean;
  transactionType: string | null;
  policyNumber: string | null;
  effectiveDate: string | null;
  premiumDelta: number | null;
};
export type ActivityEntryDTO = {
  at: string;
  who: string;
  what: string;
  ctx?: string | null;
  conf?: string | null;
};

export type EndorsementDetailDTO = {
  classification: string;
  premiumBearing: boolean;
  premiumDelta: string;
  rationale: string;
  diff: EndDiffRowDTO[];
  appetite: EndAppetiteDTO[];
  hardRulePassed: boolean;
  schedule: string[];
  endorsementId: string;
  policyNumber: string;
  namedInsured: string;
  requestedChangeType: string;
  requestedChangeDetail: string;
  status: string;
  authorityCheck: AuthorityCheckDTO;
  carrierReferral: CarrierReferralDTO;
  writeBackRecord: WriteBackRecordDTO;
  activity: ActivityEntryDTO[];
};

export type EndorsementRowDTO = {
  id: string;
  policy: string;
  insured: string;
  type: string;
  requested: string;
  impact: string;
  status: string;
};

function headers(role: Role): HeadersInit {
  return {
    "content-type": "application/json",
    "x-tenant-id": TENANT_ID,
    "x-user-id": `${TENANT_ID}-${role}`,
    "x-role": role,
  };
}

async function request<T>(path: string, role: Role, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/endorsement-processing${path}`, {
    ...init,
    headers: { ...headers(role), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`endorsement-processing API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function listEndorsements(role: Role): Promise<EndorsementRowDTO[]> {
  return request<EndorsementRowDTO[]>("", role);
}

export function getEndorsement(role: Role, submissionId: string): Promise<EndorsementDetailDTO> {
  return request<EndorsementDetailDTO>(`/${submissionId}`, role);
}

export function runScenario(role: Role, scenario: string): Promise<EndorsementDetailDTO> {
  return request<EndorsementDetailDTO>(`/run?scenario=${encodeURIComponent(scenario)}`, role, {
    method: "POST",
  });
}

export function actOnEndorsement(
  role: Role,
  submissionId: string,
  action: "approve" | "send" | "escalate",
): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>(`/${submissionId}/act`, role, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
