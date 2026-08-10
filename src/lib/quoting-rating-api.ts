/* ============================================================
   Quoting & Rating Support — API client.
   Talks to the real backend (Backend-AI-OS) at
   /api/mga/quoting-rating/*. Scoped to this one workflow only —
   no other screen imports this file, and no other screen is
   affected if the backend is unreachable: every call here is
   wrapped by the caller in a try/catch that falls back to the
   existing slider-based rating demo (mocks.ts, untouched).

   Auth is the backend's Phase-0 header stub (x-tenant-id /
   x-user-id / x-role) — there is no real login yet on either
   side, so this maps the existing `useRole()` prototype role
   onto the seeded demo-mga junior/senior users.
   ============================================================ */

import type { Role } from "@/components/app/role";

const BASE_URL = import.meta.env.VITE_MGA_API_BASE_URL ?? "http://localhost:4000/api/mga";

const TENANT_ID = "demo-mga";

export type StateCalculationDTO = {
  state: string;
  ratePlanVersionUsed: string | null;
  ratePlanCurrencyCheck: string;
  allocatedExposure: number;
  basePremium: number | null;
  suggestedAdjustmentPct: number | null;
  adjustmentGrounding: string | null;
  requestedAdjustmentPct: number | null;
  appliedAdjustmentPct: number;
  adjustmentCapped: boolean;
  premiumAfterAdjustment: number | null;
  minimumPremiumApplied: boolean;
  finalStatePremium: number | null;
  blockedReason: string | null;
};

export type BenchmarkComparisonDTO = {
  priorPremium: number | null;
  pctVariance: number | null;
  flaggedForReview: boolean;
};

export type WorksheetDetailDTO = {
  worksheetId: string;
  submissionId: string;
  namedInsured: string;
  classCode: string;
  stateCalculations: StateCalculationDTO[];
  totalIndicatedPremium: number | null;
  benchmarkComparison: BenchmarkComparisonDTO;
  status: string;
  activity: { at: string; who: string; what: string; ctx?: string | null; conf?: string | null }[];
};

export type WorksheetRowDTO = {
  id: string;
  namedInsured: string;
  classCode: string;
  states: string;
  totalIndicatedPremium: string;
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
  const res = await fetch(`${BASE_URL}/quoting-rating${path}`, {
    ...init,
    headers: { ...headers(role), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`quoting-rating API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function listWorksheets(role: Role): Promise<WorksheetRowDTO[]> {
  return request<WorksheetRowDTO[]>("", role);
}

export function getWorksheet(role: Role, submissionId: string): Promise<WorksheetDetailDTO> {
  return request<WorksheetDetailDTO>(`/${submissionId}`, role);
}

export function runScenario(role: Role, scenario: string): Promise<WorksheetDetailDTO> {
  return request<WorksheetDetailDTO>(`/run?scenario=${encodeURIComponent(scenario)}`, role, {
    method: "POST",
  });
}

export function actOnWorksheet(
  role: Role,
  submissionId: string,
  action: "approve" | "send" | "escalate",
): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>(`/${submissionId}/act`, role, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
