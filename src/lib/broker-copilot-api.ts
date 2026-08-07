/* ============================================================
   Broker Communication Copilot — API client.
   Talks to the real backend (Backend-AI-OS) at
   /api/mga/broker-copilot/*. Scoped to this one workflow only —
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

const BASE_URL =
  import.meta.env.VITE_MGA_API_BASE_URL ?? "http://localhost:4000/api/mga";

const TENANT_ID = "demo-mga";

export type CommDraftDTO = {
  id: string;
  type: string;
  sourceWorkflow: string;
  sourceId: string;
  sourceRoute: string;
  namedInsured: string;
  broker: {
    name: string;
    agency: string;
    email: string;
    tenureYears: number | null;
    volumeTier: string | null;
  };
  subject: string;
  tone: string;
  toneWhy: string;
  sensitive: boolean;
  requiresComplianceReview: boolean;
  combined?: string | null;
  deadlineRef?: string | null;
  citations: { claim: string; source: string }[];
  body: string;
  status: string;
  generatedAt: string;
  activity: { at: string; who: string; what: string; ctx?: string | null; conf?: string | null }[];
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
  const res = await fetch(`${BASE_URL}/broker-copilot${path}`, {
    ...init,
    headers: { ...headers(role), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`broker-copilot API ${res.status}: ${await res.text().catch(() => res.statusText)}`);
  }
  return res.json() as Promise<T>;
}

export function listDrafts(role: Role): Promise<CommDraftDTO[]> {
  return request<CommDraftDTO[]>("", role);
}

export function draftFromDecision(
  role: Role,
  sourceWorkflow: "submission-triage" | "renewal-management",
  submissionId: string,
): Promise<CommDraftDTO> {
  return request<CommDraftDTO>("/draft", role, {
    method: "POST",
    body: JSON.stringify({ source_workflow: sourceWorkflow, submission_id: submissionId }),
  });
}

export function actOnDraft(
  role: Role,
  submissionId: string,
  action: "approve" | "send" | "escalate",
  body?: string,
): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>(`/${submissionId}/act`, role, {
    method: "POST",
    body: JSON.stringify({ action, body }),
  });
}
