import type React from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import {
  Endorsements,
  Quoting,
  BindOrder,
  AppetiteGovernance,
  Portfolio,
  Bordereau,
  Claims,
} from "@/components/app/Workflows";
import { SubmissionTriage } from "@/components/app/SubmissionTriage";
import { RenewalManagement } from "@/components/app/RenewalManagement";
import { BrokerCopilot } from "@/components/app/BrokerCopilot";
import { RulesConsole } from "@/components/app/RulesConsole";

const map: Record<string, React.ComponentType> = {
  "submission-triage": SubmissionTriage,
  "renewal-management": RenewalManagement,
  "broker-copilot": BrokerCopilot,
  endorsements: Endorsements,
  quoting: Quoting,
  bind: BindOrder,
  appetite: AppetiteGovernance,
  portfolio: Portfolio,
  bordereau: Bordereau,
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
