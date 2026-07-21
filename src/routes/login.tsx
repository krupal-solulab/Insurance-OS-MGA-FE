import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/coverline/AuthPages";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Coverline" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});
