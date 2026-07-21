import type React from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ExtractionCore, DecisionCore } from "@/components/app/Foundation";

const map: Record<string, React.ComponentType> = {
  "extraction-core": ExtractionCore,
  "decision-core": DecisionCore,
};

export const Route = createFileRoute("/app/foundation/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    const Comp = map[slug];
    if (!Comp) throw notFound();
    return <Comp />;
  },
});
