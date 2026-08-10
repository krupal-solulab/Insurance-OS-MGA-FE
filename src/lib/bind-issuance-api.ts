/* ============================================================
   Bind Order & Issuance — API client.
   Talks to the real backend (Backend-AI-OS) at
   /api/mga/bind-issuance/*. Scoped to this one workflow only —
   no other screen imports this file, and no other screen is
   affected if the backend is unreachable: every call here is
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

export type WorksheetReferenceDTO = {
  worksheetId: string;
  worksheetDate: string | null;
  premium: number;
};
export type StalenessCheckDTO = {
  daysSinceWorksheet: number | null;
  exceedsThreshold: boolean;
  materialUpdateLoggedSince: boolean;
};
export type SubjectivityDTO = {
  description: string;
  materiality: string;
  status: string;
  lifecycleStage: string;
};
export type AuthorityReconfirmationDTO = {
  outcome: string;
  checkedPremium: number | null;
  delegatedCeiling: number;
  referralDraftText: string | null;
};
export type WriteBackDTO = { logged: boolean; bordereauSchemaValidated: boolean };
export type DiscrepancyDTO = { field: string; bound: string; issued: string };
export type IssuanceReconciliationDTO = { status: string; discrepancyDetail: DiscrepancyDTO[] };
export type PostBindObligationDTO = {
  description: string;
  dueDate: string | null;
  status: string;
  reminderDaysBefore: number[];
};
export type DownstreamTriggersDTO = { bindConfirmation: boolean; policyDelivered: boolean };

export type BindDetailDTO = {
  bindId: string;
  submissionId: string;
  namedInsured: string;
  worksheetReference: WorksheetReferenceDTO | null;
  stalenessCheck: StalenessCheckDTO | null;
  preBindSubjectivities: SubjectivityDTO[];
  authorityReconfirmation: AuthorityReconfirmationDTO | null;
  bindOrderStatus: string;
  pasWriteBack: WriteBackDTO;
  issuanceReconciliation: IssuanceReconciliationDTO;
  postBindObligations: PostBindObligationDTO[];
  downstreamTriggersFired: DownstreamTriggersDTO;
  rationale: string;
  activity: { at: string; who: string; what: string; ctx?: string | null; conf?: string | null }[];
};

export type BindRowDTO = { id: string; namedInsured: string; premium: string; status: string };

function headers(role: Role): HeadersInit {
  return {
    "content-type": "application/json",
    "x-tenant-id": TENANT_ID,
    "x-user-id": `${TENANT_ID}-${role}`,
    "x-role": role,
  };
}

async function request<T>(path: string, role: Role, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/bind-issuance${path}`, {
    ...init,
    headers: { ...headers(role), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`bind-issuance API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function listBinds(role: Role): Promise<BindRowDTO[]> {
  return request<BindRowDTO[]>("", role);
}

export function getBind(role: Role, submissionId: string): Promise<BindDetailDTO> {
  return request<BindDetailDTO>(`/${submissionId}`, role);
}

export function runScenario(role: Role, scenario: string): Promise<BindDetailDTO> {
  return request<BindDetailDTO>(`/run?scenario=${encodeURIComponent(scenario)}`, role, {
    method: "POST",
  });
}

export function actOnBind(
  role: Role,
  submissionId: string,
  action: "approve" | "send" | "escalate",
): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>(`/${submissionId}/act`, role, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
