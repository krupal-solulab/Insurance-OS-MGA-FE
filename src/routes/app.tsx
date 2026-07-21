import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Coverline OS — MGA AI Operating System" },
      { name: "description", content: "The AI operating system for MGAs — submission triage, renewals, broker copilot, endorsements, quoting, binding, governance, portfolio, bordereau, and claims." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AppShell />,
});
