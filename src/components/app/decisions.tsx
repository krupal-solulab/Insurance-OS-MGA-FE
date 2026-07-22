import { createContext, useContext, useState, type ReactNode } from "react";
import { decisionsLog, nowClock } from "./mocks";

/* ============================================================
   Shared in-session decisions/audit store. Every workflow
   appends here on a real action; Governance & Portfolio read
   from it. No backend — a real audit-log query slots in later.
   ============================================================ */

export type DecisionEntry = { at: string; actor: "ai" | "human"; who: string; what: string; ctx?: string; workflow?: string };

const seed: DecisionEntry[] = decisionsLog.map((d) => ({
  at: d.at,
  actor: d.who.includes("AI") ? "ai" : "human",
  who: d.who,
  what: d.what,
  ctx: d.ctx,
}));

const Ctx = createContext<{ entries: DecisionEntry[]; record: (e: Omit<DecisionEntry, "at">) => void }>({ entries: seed, record: () => {} });
export const useDecisions = () => useContext(Ctx);

export function DecisionsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<DecisionEntry[]>(seed);
  const record = (e: Omit<DecisionEntry, "at">) => setEntries((prev) => [...prev, { at: nowClock(), ...e }]);
  return <Ctx.Provider value={{ entries, record }}>{children}</Ctx.Provider>;
}
