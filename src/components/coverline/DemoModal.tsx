import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { X, ArrowRight, Check, Loader2, AlertTriangle } from "lucide-react";

/* ============================================================
   "Book a demo" modal — UI ONLY (no backend wired yet).
   Client-side validation, inline errors, and animated
   success / error states. On submit it simulates a request;
   swap the TODO in `submit()` for a real endpoint later.
   ============================================================ */

type Fields = {
  name: string;
  email: string;
  company: string;
  size: string;
  message: string;
};

const EMPTY: Fields = { name: "", email: "", company: "", size: "", message: "" };

const SIZES = ["1–10", "11–50", "51–200", "201–500", "500+"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: Fields): Partial<Record<keyof Fields, string>> {
  const e: Partial<Record<keyof Fields, string>> = {};
  if (!f.name.trim()) e.name = "Please enter your name.";
  if (!f.email.trim()) e.email = "Please enter your work email.";
  else if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.company.trim()) e.company = "Please enter your company name.";
  if (!f.size) e.size = "Select a company size.";
  return e;
}

export function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  // Reset shortly after close so the modal reopens clean.
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setFields(EMPTY);
      setErrors({});
      setStatus("idle");
    }, 250);
    return () => clearTimeout(t);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (k: keyof Fields, v: string) => {
    setFields((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(fields);
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setStatus("submitting");
    // TODO(demo-endpoint): POST `fields` to your real handler
    //   e.g. a TanStack Start server route /api/demo-request, an email
    //   service, or a CRM webhook. Currently UI-only (simulated).
    await new Promise((r) => setTimeout(r, 900));
    setStatus("success");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />

          {/* panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book a demo"
            className="grain relative z-10 w-full max-w-lg rule-t rule-b border-x border-border bg-background shadow-[0_40px_80px_-32px_var(--color-ink)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 border-b border-border p-6">
                <div>
                  <div className="label-eyebrow flex items-center gap-2">
                    <span className="font-mono text-accent">→</span> Book a demo
                  </div>
                  <h2 className="mt-2 font-serif text-2xl leading-tight tracking-[-0.01em]">
                    See Coverline on your own book.
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-none border border-transparent p-1.5 text-ink-soft transition hover:border-border hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 320, damping: 18 }}
                      className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent"
                    >
                      <Check className="h-7 w-7" />
                    </motion.div>
                    <h3 className="mt-5 font-serif text-2xl tracking-[-0.01em]">Request received.</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                      Thanks{fields.name ? `, ${fields.name.split(" ")[0]}` : ""} — we'll reach out at{" "}
                      <span className="font-medium text-foreground">{fields.email}</span> to schedule your walkthrough.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-6 inline-flex items-center gap-2 rounded-none bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Done
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={submit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 p-6"
                    noValidate
                  >
                    {status === "error" && (
                      <div className="flex items-start gap-2 rule-t rule-b bg-destructive/5 p-3 text-[13px] text-destructive">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        Something went wrong sending your request. Please try again.
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Full name" value={fields.name} onChange={(v) => set("name", v)} error={errors.name} autoFocus />
                      <Input label="Work email" type="email" value={fields.email} onChange={(v) => set("email", v)} error={errors.email} />
                    </div>
                    <Input label="Company" value={fields.company} onChange={(v) => set("company", v)} error={errors.company} />

                    <Field label="Company size" error={errors.size}>
                      <div className="flex flex-wrap gap-2">
                        {SIZES.map((s) => (
                          <button
                            type="button"
                            key={s}
                            onClick={() => set("size", s)}
                            className={`rounded-none border px-3 py-1.5 text-sm transition ${
                              fields.size === s
                                ? "border-foreground bg-foreground text-background"
                                : "border-border text-ink-soft hover:border-foreground/50 hover:text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Anything we should know? (optional)">
                      <textarea
                        rows={3}
                        value={fields.message}
                        onChange={(e) => set("message", e.target.value)}
                        className="w-full resize-none rounded-none border border-border bg-background p-3 text-sm outline-none transition focus:border-foreground/50"
                        placeholder="Lines of business, submission volume, current tools…"
                      />
                    </Field>

                    <button
                      type="submit"
                      disabled={status === "submitting"}
                      className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-none bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-70"
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          Request demo <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-muted-foreground">
                      We'll only use your details to schedule your demo.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label-eyebrow mb-2 block !text-[10px]">{label}</label>
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

function Input({
  label,
  value,
  onChange,
  error,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <Field label={label} error={error}>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-none border bg-background px-3 py-2 text-sm outline-none transition focus:border-foreground/50 ${
          error ? "border-destructive/60" : "border-border"
        }`}
      />
    </Field>
  );
}
