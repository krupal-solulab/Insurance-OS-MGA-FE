import { createFileRoute } from "@tanstack/react-router";
import { CoverlineLanding } from "@/components/coverline/CoverlineLanding";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coverline — AI operating system for MGA underwriting" },
      {
        name: "description",
        content:
          "Coverline automates submission triage, renewals, and broker communication for MGAs — with your underwriter approving every decision.",
      },
    ],
  }),
  component: CoverlineLanding,
});
