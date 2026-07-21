import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

/* ============================================================
   Role model (prototype, no backend).
   Two roles: Junior (Assistant UW) and Senior UW. In the real
   product, roles come from an admin-provisioned account — this
   switcher just simulates "who is signed in" so both experiences
   can be demoed. Swap `useRole()` for the account's role later.
   ============================================================ */

export type Role = "junior" | "senior";
const KEY = "coverline-role";

/** Junior approval authority — above this premium, decisions route to a senior. */
export const JUNIOR_PREMIUM_CAP = 150000;

/** Signed-in identity shown in the top bar, by role. */
export const ROLE_IDENTITY: Record<Role, { name: string; title: string; initials: string }> = {
  senior: { name: "Priya R.", title: "Sr. Underwriter", initials: "PR" },
  junior: { name: "Sofia A.", title: "Jr. Underwriter", initials: "SA" },
};

/** Parse "$187,400" / "$42.8M" / "$96k" → number. */
export function parseMoney(s: string): number {
  const raw = String(s).replace(/[$£,\s]/g, "");
  if (/m$/i.test(raw)) return parseFloat(raw) * 1_000_000;
  if (/k$/i.test(raw)) return parseFloat(raw) * 1_000;
  const n = parseFloat(raw);
  return Number.isNaN(n) ? 0 : n;
}

/* Demo logins (prototype only — no backend). These two emails sign in AND
   set the role. Any other email is a generic sign-in that defaults to Senior. */
export const DEMO_LOGINS: { email: string; password: string; role: Role; label: string }[] = [
  { email: "senior@coverline.test", password: "coverline", role: "senior", label: "Senior UW" },
  { email: "junior@coverline.test", password: "coverline", role: "junior", label: "Junior UW" },
];

export function setStoredRole(role: Role) {
  try {
    localStorage.setItem(KEY, role);
  } catch {
    /* ignore */
  }
}

/** Returns the role for a login. Unknown / new users default to Senior. */
export function resolveRoleFromLogin(email: string, password: string): Role {
  const match = DEMO_LOGINS.find(
    (d) => d.email.toLowerCase() === email.trim().toLowerCase() && d.password === password,
  );
  return match ? match.role : "senior";
}

const RoleCtx = createContext<{ role: Role; setRole: (r: Role) => void }>({ role: "senior", setRole: () => {} });
export const useRole = () => useContext(RoleCtx);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("senior");
  useEffect(() => {
    try {
      const r = localStorage.getItem(KEY);
      if (r === "junior" || r === "senior") setRoleState(r);
    } catch {
      /* ignore */
    }
  }, []);
  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem(KEY, r);
    } catch {
      /* ignore */
    }
  };
  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>;
}

export function RoleSwitch() {
  const { role, setRole } = useRole();
  const opts: { key: Role; label: string; icon: any }[] = [
    { key: "junior", label: "Jr UW", icon: UserCog },
    { key: "senior", label: "Senior UW", icon: ShieldCheck },
  ];
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-secondary/60 p-0.5" title="Prototype role — simulates the signed-in underwriter">
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => setRole(o.key)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition",
            role === o.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <o.icon className="h-3.5 w-3.5" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Small inline banner explaining a view-only / senior-only gate. */
export function SeniorOnlyNote({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-2.5 text-[12px] text-muted-foreground">
      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
      {children}
    </div>
  );
}
