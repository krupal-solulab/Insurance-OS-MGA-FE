import type React from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { BindOrder } from "@/components/app/BindOrder";
import { Endorsements, Claims } from "@/components/app/EndorsementClaims";
import { AppetiteGovernance, Portfolio } from "@/components/app/Reporting";
import { SubmissionTriage } from "@/components/app/SubmissionTriage";
import { RenewalManagement } from "@/components/app/RenewalManagement";
import { BrokerCopilot } from "@/components/app/BrokerCopilot";
import { BordereauReporting } from "@/components/app/BordereauReporting";
import { QuotingRating } from "@/components/app/QuotingRating";
import { RulesConsole } from "@/components/app/RulesConsole";

const map: Record<string, React.ComponentType> = {
  "submission-triage": SubmissionTriage,
  "renewal-management": RenewalManagement,
  "broker-copilot": BrokerCopilot,
  endorsements: Endorsements,
  quoting: QuotingRating,
  bind: BindOrder,
  appetite: AppetiteGovernance,
  portfolio: Portfolio,
  bordereau: BordereauReporting,
  claims: Claims,
  "rules-console": RulesConsole,
};

export const Route = createFileRoute("/app/workflows/$slug")({
  component: WorkflowRoute,
  notFoundComponent: () => <div className="p-6 text-sm text-muted-foreground">Unknown workflow.</div>,
});

function WorkflowRoute() {
  const { slug } = Route.useParams();
  const Comp = map[slug];
  if (!Comp) throw notFound();
  return <Comp />;
}
