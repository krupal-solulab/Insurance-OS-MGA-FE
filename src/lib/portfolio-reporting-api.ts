/* ============================================================
   Portfolio & Book Performance Reporting — API client.
   Talks to the real backend (Backend-AI-OS) at
   /api/mga/portfolio-reporting/*. Scoped to this one workflow
   only — no other screen imports this file, and no other screen
   is affected if the backend is unreachable: every call here is
   wrapped by the caller in a try/catch that falls back to the
   existing mock book performance data (mocks.ts, untouched).

   Auth is the backend's Phase-0 header stub (x-tenant-id /
   x-user-id / x-role) — there is no real login yet on either
   side, so this maps the existing `useRole()` prototype role
   onto the seeded demo-mga junior/senior users.
   ============================================================ */

import type { Role } from "@/components/app/role";

const BASE_URL = import.meta.env.VITE_MGA_API_BASE_URL ?? "http://localhost:4000/api/mga";

const TENANT_ID = "demo-mga";

export type FunnelStageDTO = { stage: string; count: number; pctOfPriorStage: number | null };
export type LossRatioDTO = {
  periodBasis: string;
  earnedPremium: number;
  incurredLosses: number;
  ratioPct: number;
  lowVolumeFlag: boolean;
  singleEventDrivenFlag: boolean;
  detail: string;
};
export type RenewalRetentionDTO = {
  eligible: number;
  retained: number;
  nonRenewedUnderwritingDecision: number;
  lapsedNoDecision: number;
  retentionRatePct: number;
  lineItems: Record<string, string>[];
};
export type GapDTO = {
  sourceWorkflow: string;
  dateRange: string;
  reason: string;
  crossReferencedFindingId: string | null;
};
export type DataCompletenessDTO = { status: string; gaps: GapDTO[] };
export type BrokerProductionDTO = {
  brokerAgency: string;
  currentPeriodPremium: number;
  priorPeriodPremium: number;
  pctChange: number;
  significantDecline: boolean;
  detail: string;
};
export type AppetiteExposureSectionDTO = {
  pulledFrom: string;
  findingId: string;
  summary: string;
  lowVolumeFlag: boolean;
};

export type PortfolioReportDetailDTO = {
  reportId: string;
  period: string;
  dataCompleteness: DataCompletenessDTO;
  funnel: FunnelStageDTO[];
  lossRatio: LossRatioDTO | null;
  renewalRetention: RenewalRetentionDTO | null;
  brokerProduction: BrokerProductionDTO[];
  appetiteExposureSection: AppetiteExposureSectionDTO | null;
  status: string;
  rationale: string;
  activity: { at: string; who: string; what: string; ctx?: string | null; conf?: string | null }[];
};

export type PortfolioReportRowDTO = { id: string; period: string; status: string };

function headers(role: Role): HeadersInit {
  return {
    "content-type": "application/json",
    "x-tenant-id": TENANT_ID,
    "x-user-id": `${TENANT_ID}-${role}`,
    "x-role": role,
  };
}

async function request<T>(path: string, role: Role, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/portfolio-reporting${path}`, {
    ...init,
    headers: { ...headers(role), ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`portfolio-reporting API ${res.status}: ${detail}`);
  }
  return res.json() as Promise<T>;
}

export function listReports(role: Role): Promise<PortfolioReportRowDTO[]> {
  return request<PortfolioReportRowDTO[]>("", role);
}

export function getReport(role: Role, submissionId: string): Promise<PortfolioReportDetailDTO> {
  return request<PortfolioReportDetailDTO>(`/${submissionId}`, role);
}

export function runScenario(role: Role, scenario: string): Promise<PortfolioReportDetailDTO> {
  return request<PortfolioReportDetailDTO>(`/run?scenario=${encodeURIComponent(scenario)}`, role, {
    method: "POST",
  });
}

export function actOnReport(
  role: Role,
  submissionId: string,
  action: "approve" | "send" | "escalate",
): Promise<{ id: string; status: string }> {
  return request<{ id: string; status: string }>(`/${submissionId}/act`, role, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
