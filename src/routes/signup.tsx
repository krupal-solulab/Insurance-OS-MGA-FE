import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/components/coverline/AuthPages";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Coverline" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignupPage,
});
