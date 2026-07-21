import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, Loader2, AlertTriangle, Check, ShieldCheck, ScrollText, Sparkles } from "lucide-react";

/* ============================================================
   Login / Signup — UI ONLY (no auth backend wired).
   Full client-side validation, loading + error states.
   On a valid submit they navigate to /app (simulated sign-in).
   Swap the TODO in `onSubmit` for a real provider later.
   ============================================================ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EASE = [0.22, 1, 0.36, 1] as const;

function go(path: string) {
  if (typeof window !== "undefined") window.location.assign(path);
}

function Wordmark() {
  return (
    <a href="/" className="inline-flex items-baseline gap-[2px] font-serif">
      <span className="text-[1.35rem] font-600 tracking-[-0.02em] text-foreground">Coverline</span>
      <span className="translate-y-[-0.15em] text-lg leading-none text-accent">.</span>
    </a>
  );
}

/** Two-column editorial shell: ink brand panel + form. */
function AuthShell({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="grain relative hidden overflow-hidden bg-foreground text-background lg:block">
        <div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(120%_80%_at_20%_0%,black,transparent_70%)]"
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <Wordmark />
          <div>
            <div className="label-eyebrow flex items-center gap-3 !text-background/60">
              <span className="font-mono text-accent">MGA OS</span>
              <span>Underwriting, human-approved</span>
            </div>
            <h2 className="mt-5 max-w-md font-serif text-4xl leading-[1.05] tracking-[-0.02em]">
              The AI operating system for MGA underwriting.
            </h2>
            <ul className="mt-8 space-y-3 text-sm text-background/75">
              {[
                { icon: Sparkles, t: "Every submission read, checked, and scored" },
                { icon: ShieldCheck, t: "Your underwriter approves every decision" },
                { icon: ScrollText, t: "Every recommendation cited to source" },
              ].map(({ icon: Icon, t }, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3"
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={reduce ? undefined : { opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: EASE }}
                >
                  <Icon className="h-4 w-4 text-accent" />
                  {t}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="font-mono text-[11px] text-background/50">© 2026 Coverline · MGA underwriting</div>
        </div>
      </aside>

      {/* Form column */}
      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Wordmark />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 md:px-8">
          <motion.div
            className="w-full max-w-sm"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, error, children, hint }: { label: string; error?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="label-eyebrow !text-[10px]">{label}</label>
        {hint}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-[12px] text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  error,
  type = "text",
  autoFocus,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoFocus?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-none border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-foreground/50 ${
        error ? "border-destructive/60" : "border-border"
      }`}
    />
  );
}

function ErrorBanner({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mb-4 flex items-start gap-2 rule-t rule-b bg-destructive/5 p-3 text-[13px] text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex w-full items-center justify-center gap-2 rounded-none bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-70"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

/* ------------------------------- Login ------------------------------- */

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [banner, setBanner] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = "Enter your email.";
    else if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    setBanner(false);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    // TODO(auth): replace with a real sign-in call. UI-only today.
    await new Promise((r) => setTimeout(r, 800));
    go("/app");
  };

  return (
    <AuthShell>
      <div className="label-eyebrow flex items-center gap-3">
        <span className="font-mono text-accent">→</span> Log in
      </div>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.01em]">Welcome back.</h1>
      <p className="mt-2 text-sm text-ink-soft">Sign in to your Coverline workspace.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <ErrorBanner show={banner}>Invalid email or password. Please try again.</ErrorBanner>
        <Field label="Work email" error={errors.email}>
          <TextInput
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              setErrors((e) => ({ ...e, email: undefined }));
            }}
            error={errors.email}
            autoFocus
            placeholder="you@company.com"
          />
        </Field>
        <Field
          label="Password"
          error={errors.password}
          hint={
            <a href="#" className="text-[11px] text-ink-soft underline-offset-4 hover:text-foreground hover:underline">
              Forgot password?
            </a>
          }
        >
          <TextInput
            type="password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            placeholder="••••••••"
          />
        </Field>
        <SubmitButton loading={loading}>
          {loading ? "Signing in…" : (<>Log in <ArrowRight className="h-4 w-4" /></>)}
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        New to Coverline?{" "}
        <a href="/signup" className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline">
          Create an account
        </a>
      </p>
    </AuthShell>
  );
}

/* ------------------------------- Signup ------------------------------- */

function passwordScore(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const label = pw.length === 0 ? "" : score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  return { score, label };
}

export function SignupPage() {
  const [f, setF] = useState({ name: "", email: "", company: "", password: "", terms: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { score, label } = useMemo(() => passwordScore(f.password), [f.password]);

  const set = (k: keyof typeof f, v: string | boolean) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = "Enter your name.";
    if (!f.email.trim()) errs.email = "Enter your work email.";
    else if (!EMAIL_RE.test(f.email.trim())) errs.email = "Enter a valid email address.";
    if (!f.company.trim()) errs.company = "Enter your company name.";
    if (!f.password) errs.password = "Create a password.";
    else if (f.password.length < 8) errs.password = "Use at least 8 characters.";
    if (!f.terms) errs.terms = "Please accept the terms to continue.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    // TODO(auth): replace with a real account-creation call. UI-only today.
    await new Promise((r) => setTimeout(r, 900));
    go("/app");
  };

  const barTone = score <= 1 ? "bg-destructive" : score === 2 ? "bg-warn" : score === 3 ? "bg-accent" : "bg-success";

  return (
    <AuthShell>
      <div className="label-eyebrow flex items-center gap-3">
        <span className="font-mono text-accent">→</span> Create account
      </div>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-[-0.01em]">Get started.</h1>
      <p className="mt-2 text-sm text-ink-soft">Set up your MGA workspace in a couple of minutes.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <TextInput value={f.name} onChange={(v) => set("name", v)} error={errors.name} autoFocus />
        </Field>
        <Field label="Work email" error={errors.email}>
          <TextInput type="email" value={f.email} onChange={(v) => set("email", v)} error={errors.email} placeholder="you@company.com" />
        </Field>
        <Field label="Company" error={errors.company}>
          <TextInput value={f.company} onChange={(v) => set("company", v)} error={errors.company} />
        </Field>
        <Field label="Password" error={errors.password}>
          <TextInput type="password" value={f.password} onChange={(v) => set("password", v)} error={errors.password} placeholder="At least 8 characters" />
          {f.password.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-full flex-1 rounded-full transition-colors ${i < score ? barTone : "bg-secondary"}`} />
                ))}
              </div>
              <span className="w-12 text-right font-mono text-[10px] text-muted-foreground">{label}</span>
            </div>
          )}
        </Field>

        <div>
          <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-ink-soft">
            <button
              type="button"
              onClick={() => set("terms", !f.terms)}
              aria-pressed={f.terms}
              className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-none border transition ${
                f.terms ? "border-foreground bg-foreground text-background" : "border-border bg-background"
              }`}
            >
              {f.terms && <Check className="h-3 w-3" />}
            </button>
            <span>
              I agree to the{" "}
              <a href="#" className="text-foreground underline-offset-4 hover:text-accent hover:underline">Terms</a> and{" "}
              <a href="#" className="text-foreground underline-offset-4 hover:text-accent hover:underline">Privacy Policy</a>.
            </span>
          </label>
          <AnimatePresence>
            {errors.terms && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 text-[12px] text-destructive"
              >
                {errors.terms}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <SubmitButton loading={loading}>
          {loading ? "Creating account…" : (<>Create account <ArrowRight className="h-4 w-4" /></>)}
        </SubmitButton>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have an account?{" "}
        <a href="/login" className="font-medium text-foreground underline-offset-4 hover:text-accent hover:underline">
          Log in
        </a>
      </p>
    </AuthShell>
  );
}
