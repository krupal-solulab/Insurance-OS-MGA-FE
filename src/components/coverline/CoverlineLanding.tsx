import { createContext, useContext, useState } from "react";
import {
  Menu,
  X,
  ArrowRight,
  FileText,
  ShieldCheck,
  ScrollText,
  Check,
  ChevronDown,
  Mail,
  Table2,
  Users,
  Database,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, RevealGroup, RevealChild, RevealLines } from "./motion";
import { DemoModal } from "./DemoModal";
import { ThemeToggle } from "./theme";
import {
  IconRead,
  IconCheck,
  IconDraft,
  IconApprove,
  IconDial,
  IconLifecycle,
  IconStack,
} from "./icons";

const nav = [
  { label: "Product", href: "#how" },
  { label: "Workflows", href: "#workflows" },
  { label: "Why MGAs", href: "#why" },
  { label: "Integrations", href: "#integrations" },
  { label: "Security", href: "#security" },
];

/** Opens the "Book a demo" modal. Provided at the page root. */
const OpenDemoContext = createContext<() => void>(() => {});
const useOpenDemo = () => useContext(OpenDemoContext);

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <a href="#top" className={`inline-flex items-baseline gap-[2px] font-serif ${className}`}>
      <span className="text-[1.35rem] font-600 tracking-[-0.02em] text-foreground">
        Coverline
      </span>
      <span className="translate-y-[-0.15em] text-accent text-lg leading-none">.</span>
    </a>
  );
}

function PrimaryButton({
  children,
  href = "#demo",
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-none bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-[0_10px_24px_-14px_var(--color-ink)] transition-colors hover:bg-accent hover:text-accent-foreground ${className}`;
  const motionProps = {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { type: "spring" as const, stiffness: 400, damping: 22 },
  };
  if (onClick) {
    return (
      <motion.button type="button" onClick={onClick} className={cls} {...motionProps}>
        {children}
      </motion.button>
    );
  }
  return (
    <motion.a href={href} className={cls} {...motionProps}>
      {children}
    </motion.a>
  );
}

function Eyebrow({ children, num }: { children: React.ReactNode; num?: string }) {
  return (
    <div className="label-eyebrow flex items-center gap-3">
      {num && <span className="font-mono text-accent">{num}</span>}
      <span>{children}</span>
    </div>
  );
}

/** Small, unobtrusive honesty tag for illustrative (non-customer) figures. */
function Illustrative({ children = "Illustrative example", className = "" }: { children?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-none border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground ${className}`}
    >
      <span className="inline-block h-1 w-1 rounded-full bg-accent/70" />
      {children}
    </span>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const openDemo = useOpenDemo();
  return (
    <header id="top" className="sticky top-0 z-40 rule-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group relative text-sm text-ink-soft transition-colors hover:text-foreground"
            >
              {n.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-5 md:flex">
          <ThemeToggle />
          <a
            href="/login"
            className="text-sm text-ink-soft transition-colors hover:text-foreground"
          >
            Log in
          </a>
          <PrimaryButton onClick={openDemo}>Book a demo</PrimaryButton>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="rule-t bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-foreground"
              >
                {n.label}
              </a>
            ))}
            <a href="/login" className="py-2 text-sm text-foreground">
              Log in
            </a>
            <PrimaryButton
              className="mt-2"
              onClick={() => {
                setOpen(false);
                openDemo();
              }}
            >
              Book a demo
            </PrimaryButton>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const openDemo = useOpenDemo();
  return (
    <section className="grain relative overflow-hidden">
      {/* fine grid backdrop, faded toward the edges */}
      <div
        aria-hidden
        className="bg-grid pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(120%_80%_at_15%_0%,black,transparent_70%)]"
      />
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Eyebrow num="00 /">Built for MGAs</Eyebrow>
        </motion.div>

        <h1 className="mt-6 max-w-4xl font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] text-foreground md:text-[4.25rem]">
          <RevealLines
            lines={[
              "The AI operating system",
              <>
                built for <em className="text-accent not-italic">MGA</em>
              </>,
              <em className="text-accent not-italic" key="l3">
                underwriting.
              </em>,
            ]}
          />
        </h1>

        <Reveal as="p" delay={0.45} className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
          Coverline reads every broker submission, checks it against your appetite, and drafts a
          recommendation — renewals, submissions, and broker communication, with your underwriter
          approving every decision.
        </Reveal>

        <Reveal delay={0.55} className="mt-9 flex flex-wrap items-center gap-6">
          <PrimaryButton onClick={openDemo}>
            Book a demo <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <a
            href="#how"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground"
          >
            See how it works
            <span className="h-px w-6 bg-foreground transition-all group-hover:w-10" />
          </a>
        </Reveal>

        {/* Trust bar */}
        <RevealGroup className="mt-16 grid gap-6 rule-t rule-b py-5 text-sm text-ink-soft md:grid-cols-3 md:divide-x md:divide-border md:gap-0" stagger={0.1}>
          {[
            "Every recommendation cited to source",
            "Your underwriter approves every decision",
            "Built for MGAs, not carriers",
          ].map((t, i) => (
            <RevealChild key={i} className="flex items-center gap-3 md:px-6 md:first:pl-0">
              <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
              {t}
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

const problemDocs = [
  { name: "ACORD 125", meta: "Application" },
  { name: "Loss Run", meta: "5-yr history" },
  { name: "Financials", meta: "P&L · balance sheet" },
  { name: "Renewal Q", meta: "Questionnaire" },
];

function Problem() {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;
  const rot = (i: number) => (i % 2 === 0 ? "-1.4deg" : "1.2deg");

  return (
    <section className="rule-t bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:grid-cols-12 md:gap-10 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <Eyebrow num="01 /">The problem</Eyebrow>
          <Reveal as="h2" className="mt-5 font-serif text-3xl leading-[1.1] tracking-[-0.01em] md:text-[2.75rem]">
            Submission triage shouldn't be the bottleneck.
          </Reveal>

          {/* Supporting stat — anchors the left column instead of empty space */}
          <Reveal className="mt-10 max-w-[15rem]" y={16}>
            <div className="rule-t pt-6">
              <div className="font-serif text-6xl leading-none text-accent">30%+</div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                of an assistant underwriter's week spent reading documents before triage even begins.
              </p>
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Illustrative
              </div>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal as="p" className="text-lg leading-relaxed text-ink-soft">
            MGAs write high submission volume with lean underwriting teams. Assistant underwriters
            spend 30%+ of their week reading documents — applications, loss runs, financials —
            before a senior underwriter even sees the account. Renewals repeat this every year,
            for every account already on the book.
          </Reveal>
          <div className="mt-3">
            <Illustrative>Illustrative example</Illustrative>
          </div>

          {/* Documents in → decision out schematic */}
          <div className="mt-10 rule-t pt-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6">
              {/* Documents in — a resolving stack of submission docs */}
              <div>
                <div className="label-eyebrow mb-3">Documents in</div>
                <div className="relative h-[188px]">
                  {problemDocs.map((d, i) => (
                    <motion.div
                      key={d.name}
                      className="absolute inset-x-0"
                      style={{ top: i * 46 }}
                      initial={reduce ? false : { opacity: 0, y: 16 }}
                      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ delay: 0.1 + i * 0.11, duration: 0.45, ease }}
                    >
                      <div
                        className={`flex items-center gap-2.5 border border-border bg-card px-3 py-2.5 shadow-[0_10px_24px_-14px_var(--color-ink)] ${
                          i % 2 === 0 ? "mr-4" : "ml-4"
                        }`}
                        style={{ transform: reduce ? undefined : `rotate(${rot(i)})` }}
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center bg-accent/10 text-accent">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium text-foreground">{d.name}</div>
                          <div className="truncate text-[10px] text-muted-foreground">{d.meta}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Animated connector — sells the "AI is doing the work" moment */}
              <div className="flex items-center justify-center">
                <motion.div
                  className="relative h-[2px] w-12 bg-gradient-to-r from-border to-accent md:w-24"
                  initial={reduce ? false : { opacity: 0, scaleX: 0.4 }}
                  whileInView={reduce ? undefined : { opacity: 1, scaleX: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: 0.5, duration: 0.5, ease }}
                  style={{ transformOrigin: "left" }}
                >
                  <motion.span
                    className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-accent"
                    style={{ boxShadow: "0 0 0 4px color-mix(in oklch, var(--color-accent) 22%, transparent)" }}
                    initial={reduce ? { left: "50%", opacity: 1 } : { left: "0%", opacity: 0 }}
                    animate={
                      reduce
                        ? { left: "50%", opacity: 1 }
                        : { left: ["0%", "92%"], opacity: [0, 1, 1, 0] }
                    }
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5, delay: 1 }
                    }
                  />
                  <ArrowRight className="absolute -right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                </motion.div>
              </div>

              {/* Decision out — the confident, accent-weighted payoff */}
              <div>
                <div className="label-eyebrow mb-3 text-right">Decision out</div>
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: 0.7, duration: 0.5, ease }}
                  className="relative border border-accent/30 border-l-[3px] border-l-accent bg-accent/[0.07] p-4 shadow-[0_20px_44px_-22px_var(--color-accent)]"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <div className="label-eyebrow !text-accent">Recommendation</div>
                  </div>
                  <div className="mt-1.5 font-serif text-xl leading-tight text-foreground">Proceed to quote</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-soft">
                    <ShieldCheck className="h-3 w-3 text-success" />
                    Pending underwriter approval
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    n: "01",
    key: "Read",
    Icon: IconRead,
    body: "Coverline reads applications, loss runs, financials, and renewal questionnaires as they arrive.",
  },
  {
    n: "02",
    key: "Check",
    Icon: IconCheck,
    body: "Every submission is checked against your appetite rules, automatically.",
  },
  {
    n: "03",
    key: "Draft",
    Icon: IconDraft,
    body: "A recommendation is drafted — proceed, request more info, or decline — with every claim cited to its source document.",
  },
  {
    n: "04",
    key: "Approve",
    Icon: IconApprove,
    body: "Your underwriter reviews, edits if needed, and approves. Nothing moves forward without a human decision.",
  },
];

function HowItWorks() {
  const reduce = useReducedMotion();
  return (
    <section id="how" className="rule-t">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <Eyebrow num="02 /">How it works</Eyebrow>
          <Reveal as="h2" className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3.25rem]">
            AI drafts. <span className="text-ink-soft">Your underwriter decides.</span>
          </Reveal>
        </div>

        {/* Steps with a progress line that draws on scroll */}
        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-0 h-px bg-border" />
          <motion.div
            className="absolute left-0 top-0 h-px origin-left bg-accent"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={reduce ? undefined : { scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            style={{ right: 0 }}
          />
          <RevealGroup className="grid gap-px rule-b bg-border md:grid-cols-4" stagger={0.12}>
            {steps.map((s) => (
              <RevealChild key={s.n} className="group bg-background p-6 md:p-8">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs text-accent">{s.n}</span>
                  <span className="label-eyebrow">Step</span>
                </div>
                <s.Icon className="mt-6 h-8 w-8 text-foreground transition-transform duration-300 group-hover:-translate-y-0.5" />
                <div className="mt-4 font-serif text-2xl tracking-[-0.01em] md:text-3xl">
                  {s.key}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
              </RevealChild>
            ))}
          </RevealGroup>
        </div>

        {/* Sample-view mock strip */}
        <div className="mt-12 flex items-center justify-between">
          <div className="label-eyebrow">Sample views</div>
          <Illustrative>Illustrative data</Illustrative>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {/* 01 Read */}
          <Reveal className="rule-t rule-b bg-secondary/50 p-5 ledger-shadow" y={18}>
            <div className="label-eyebrow mb-3">Sample view · Read</div>
            <RevealGroup className="space-y-1.5 font-mono text-[11px] leading-relaxed" stagger={0.07}>
              <RevealChild className="bg-accent/15 px-1.5 py-0.5">
                Named Insured: <span className="text-accent">Riverbend Logistics LLC</span>
              </RevealChild>
              <RevealChild>Effective: 03/01/2026</RevealChild>
              <RevealChild className="bg-accent/15 px-1.5 py-0.5">
                TIV: <span className="text-accent">$14.2M</span>
              </RevealChild>
              <RevealChild>SIC: 4213 · Trucking</RevealChild>
              <RevealChild className="bg-accent/15 px-1.5 py-0.5">
                5-yr losses: <span className="text-accent">$482k / 11 claims</span>
              </RevealChild>
            </RevealGroup>
          </Reveal>
          {/* 02 Check */}
          <Reveal className="rule-t rule-b bg-secondary/50 p-5 ledger-shadow" y={18} delay={0.05}>
            <div className="label-eyebrow mb-3">Sample view · Check</div>
            <RevealGroup className="space-y-2 text-xs" stagger={0.08} as="ul">
              <RevealChild as="li" className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-success" /> Class in appetite
              </RevealChild>
              <RevealChild as="li" className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-success" /> Radius ≤ 500 mi
              </RevealChild>
              <RevealChild as="li" className="flex items-center gap-2 text-warn">
                <span className="inline-block h-2 w-2 bg-warn" /> Loss ratio flag: 42%
              </RevealChild>
              <RevealChild as="li" className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-success" /> MVR complete
              </RevealChild>
            </RevealGroup>
          </Reveal>
          {/* 03 Draft */}
          <Reveal className="rule-t rule-b bg-secondary/50 p-5 ledger-shadow" y={18} delay={0.1}>
            <div className="label-eyebrow mb-3">Sample view · Draft</div>
            <div className="font-serif text-lg leading-snug">Proceed with quote, subject to MVR review.</div>
            <div className="mt-3 border-l-2 border-accent pl-2 text-[11px] text-ink-soft">
              Cited: Loss Run p.2, ACORD 125 §4
            </div>
          </Reveal>
          {/* 04 Approve */}
          <Reveal className="rule-t rule-b bg-secondary/50 p-5 ledger-shadow" y={18} delay={0.15}>
            <div className="label-eyebrow mb-3">Sample view · Approve</div>
            <div className="flex flex-col gap-2">
              <button className="rule-t rule-b bg-foreground py-2 text-xs font-medium text-background transition-colors hover:bg-accent hover:text-accent-foreground">
                Approve &amp; send
              </button>
              <button className="rule-t rule-b py-2 text-xs font-medium transition-colors hover:bg-background">Edit draft</button>
              <button className="py-2 text-xs text-ink-soft underline-offset-4 hover:underline">
                Override with note
              </button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type Tone = "now" | "next" | "later";
type WorkflowItem = { id: string; title: string; desc?: string; steps: string[] };
type Tier = { label: string; tone: Tone; items: WorkflowItem[] };

const tiers: Tier[] = [
  {
    label: "Available now",
    tone: "now",
    items: [
      {
        id: "submission-triage",
        title: "Submission Triage",
        desc: "Read, extract, and score every new submission against your appetite.",
        steps: [
          "A new ACORD 125 arrives in the submissions inbox from a broker email.",
          "Documents are classified and fields extracted — TIV, class, loss history — each cited to its source page.",
          "The submission is checked against your appetite rules; a risk score and recommendation are drafted.",
          "It lands in the review queue for the underwriter to approve, request info, or decline.",
        ],
      },
      {
        id: "renewal-management",
        title: "Renewal Management",
        desc: "Compare every renewal against the prior term and flag what's changed.",
        steps: [
          "An expiring policy is pulled ahead of renewal alongside the prior-term file.",
          "This year's submission is compared line-by-line; exposure, TIV, and premium deltas are flagged.",
          "A renewal recommendation is drafted explaining what changed and why.",
          "The underwriter approves the terms or sends a request back to the broker.",
        ],
      },
      {
        id: "broker-communication",
        title: "Broker Communication",
        desc: "Draft missing-info requests, quote summaries, and renewal explanations — you send.",
        steps: [
          "A submission is missing a current SOV and a 5-year loss run.",
          "Coverline drafts a missing-info request naming exactly what's outstanding.",
          "You review the draft, adjust the tone if needed, and send it.",
          "The broker's reply lands back on the submission, ready for triage.",
        ],
      },
    ],
  },
  {
    label: "Coming next",
    tone: "next",
    items: [
      {
        id: "endorsement-processing",
        title: "Endorsement Processing",
        steps: [
          "A mid-term change request arrives from the broker.",
          "The delta against the in-force policy is read and priced.",
          "A premium-impact summary is drafted for underwriter approval.",
        ],
      },
      {
        id: "quoting-rating",
        title: "Quoting & Rating Support",
        steps: [
          "An approved submission moves to quote.",
          "Deductible and limit options are modeled with a plain-English pricing rationale.",
          "Quote options are drafted for the underwriter to select and send.",
        ],
      },
      {
        id: "bind-issuance",
        title: "Bind Order & Issuance Support",
        steps: [
          "The underwriter approves terms to bind.",
          "Subjectivities, inspections, and compliance checks are reconciled.",
          "A binder is drafted, ready for signature and issuance.",
        ],
      },
    ],
  },
  {
    label: "On the roadmap",
    tone: "later",
    items: [
      {
        id: "appetite-governance",
        title: "Appetite Governance & Audit",
        steps: [
          "Every AI and human decision is logged with its rationale.",
          "Overrides are tracked by rule and by underwriter.",
          "An audit-ready governance report can be generated on demand.",
        ],
      },
      {
        id: "portfolio-reporting",
        title: "Portfolio & Book Reporting",
        steps: [
          "Bound premium, hit ratio, and loss ratio roll up across the book.",
          "Trends are surfaced by broker, class, and geography.",
          "An executive summary is drafted for the book review.",
        ],
      },
      {
        id: "bordereau-reporting",
        title: "Bordereau Reporting",
        steps: [
          "Policy and premium data is assembled to the carrier's template.",
          "Totals and commissions are validated against source records.",
          "A carrier-ready bordereau is drafted for filing.",
        ],
      },
    ],
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

function WorkflowCard({
  item,
  tone,
  open,
  onToggle,
}: {
  item: WorkflowItem;
  tone: Tone;
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const dark = tone === "now";
  const cardCls =
    tone === "now"
      ? "bg-foreground text-background ledger-shadow"
      : tone === "next"
        ? "border border-border bg-background"
        : "border border-dashed border-border bg-transparent text-ink-soft";

  const affordance =
    tone === "now" ? "See how it works" : tone === "next" ? "See what's coming" : "Preview the plan";
  const statusLabel = tone === "next" ? "Coming soon" : tone === "later" ? "On the roadmap" : null;

  const numCls = dark ? "border-background/30 text-background" : "border-border text-foreground";
  const stepText = dark ? "text-background/80" : "text-ink-soft";
  const dividerCls = dark ? "border-background/15" : "border-border";
  const affordanceCls = dark
    ? "text-background/60 group-hover:text-accent"
    : "text-muted-foreground group-hover:text-accent";

  return (
    <div className={`group h-full transition-shadow ${cardCls}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer flex-col p-6 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="font-serif text-xl tracking-[-0.01em]">{item.title}</div>
          <ChevronDown
            className={`mt-1 h-4 w-4 shrink-0 transition-transform duration-200 ${affordanceCls} ${open ? "rotate-180" : ""}`}
          />
        </div>
        {item.desc && (
          <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-background/75" : "text-ink-soft"}`}>
            {item.desc}
          </p>
        )}
        <span className={`label-eyebrow mt-4 inline-flex items-center gap-2 !text-[10px] transition-colors ${affordanceCls}`}>
          {open ? "Hide" : affordance}
          <span className="h-px w-4 bg-current transition-all group-hover:w-6" />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={reduce ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="overflow-hidden"
          >
            <div className={`mx-6 border-t pb-6 pt-4 ${dividerCls}`}>
              {statusLabel && (
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-none border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] ${
                      dark ? "border-background/30 text-background/70" : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="inline-block h-1 w-1 rounded-full bg-accent" />
                    {statusLabel} · illustrative flow
                  </span>
                </div>
              )}
              <ol className="space-y-2.5">
                {item.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-[13px] leading-relaxed">
                    <span
                      className={`mt-px grid h-5 w-5 shrink-0 place-items-center border font-mono text-[10px] ${numCls}`}
                    >
                      {i + 1}
                    </span>
                    <span className={stepText}>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Workflows() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <section id="workflows" className="rule-t bg-secondary/60">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <Eyebrow num="03 /">Workflow suite</Eyebrow>
          <Reveal as="h2" className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3rem]">
            One workflow suite for the entire MGA lifecycle.
          </Reveal>
          <Reveal as="p" className="mt-5 text-lg leading-relaxed text-ink-soft">
            Not a single point tool — the operating layer for how MGAs underwrite, renew, and
            communicate with brokers.
          </Reveal>
        </div>

        <div className="mt-14 space-y-10">
          {tiers.map((tier) => (
            <Reveal key={tier.label} y={16}>
              <div className="mb-5 flex items-baseline justify-between rule-b pb-3">
                <div className="label-eyebrow flex items-center gap-3">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      tier.tone === "now"
                        ? "bg-accent"
                        : tier.tone === "next"
                          ? "bg-ink-soft"
                          : "border border-ink-soft bg-transparent"
                    }`}
                  />
                  {tier.label}
                </div>
                <span className="font-mono text-[11px] text-ink-soft">
                  {tier.items.length.toString().padStart(2, "0")}
                </span>
              </div>
              <RevealGroup className="grid items-start gap-4 md:grid-cols-3" stagger={0.08}>
                {tier.items.map((item) => (
                  <RevealChild key={item.id} className="h-full">
                    <WorkflowCard
                      item={item}
                      tone={tier.tone}
                      open={openId === item.id}
                      onToggle={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
                    />
                  </RevealChild>
                ))}
              </RevealGroup>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  const cols = [
    {
      Icon: IconDial,
      title: "MGA-native appetite logic",
      body: "Configured around how MGAs actually underwrite — lean teams, delegated authority, fast decisions — not retrofitted from enterprise carrier software.",
    },
    {
      Icon: IconLifecycle,
      title: "The full lifecycle, not one point tool",
      body: "Submission triage, renewals, and broker communication all run on the same core, so your data and decisions compound instead of living in five different tools.",
    },
    {
      Icon: IconStack,
      title: "Runs on what you already use",
      body: "Email, spreadsheets, and your CRM — no dedicated policy admin system required to get started.",
    },
  ];
  return (
    <section id="why" className="rule-t">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <Eyebrow num="04 /">Why MGAs choose Coverline</Eyebrow>
          <Reveal as="h2" className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3rem]">
            Built for MGAs. Not adapted from a carrier platform.
          </Reveal>
        </div>
        <RevealGroup className="mt-14 grid gap-px rule-t rule-b bg-border md:grid-cols-3" stagger={0.1}>
          {cols.map((c, i) => (
            <RevealChild key={c.title} className="group bg-background p-8">
              <div className="flex items-center justify-between">
                <c.Icon className="h-8 w-8 text-foreground transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
              </div>
              <div className="mt-5 font-serif text-2xl leading-snug tracking-[-0.01em]">
                {c.title}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{c.body}</p>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   06 / Integrations
   COPY FLAGGED FOR ACCURACY SIGN-OFF (Part D):
   - Tier 1 (live): Email, Spreadsheets, CRM — consistent with the
     hero claim that no policy admin system is required to start.
   - Tier 2 (Guidewire / Duck Creek / Applied Epic): labelled
     "Coming next" / "Roadmap" — NONE presented as live. Confirm
     whether any is actually in production before launch.
   - Does NOT name Coverline's own underlying connector vendor.
   ───────────────────────────────────────────────────────────── */

type IntegrationTile = { name: string; note: string; icon?: any };

const liveIntegrations: IntegrationTile[] = [
  { name: "Email", note: "Submission mailboxes read on arrival", icon: Mail },
  { name: "Spreadsheets", note: "Google Sheets & Excel", icon: Table2 },
  { name: "CRM", note: "Salesforce & HubSpot", icon: Users },
];

const pasIntegrations: { name: string; status: "Coming next" | "Roadmap" }[] = [
  { name: "Guidewire", status: "Coming next" },
  { name: "Duck Creek", status: "Roadmap" },
  { name: "Applied Epic", status: "Roadmap" },
];

function Integrations() {
  return (
    <section id="integrations" className="rule-t bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:gap-10 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <Eyebrow num="06 /">Integrations</Eyebrow>
          <Reveal as="h2" className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[2.75rem]">
            Fits the stack you already run on.
          </Reveal>
          <Reveal as="p" delay={0.08} className="mt-5 text-lg leading-relaxed text-ink-soft">
            Coverline connects to the tools your team already uses — no rip-and-replace, and no
            dedicated policy admin system required to get started.
          </Reveal>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          {/* Tier 1 — live */}
          <div className="mb-5 flex items-baseline justify-between rule-b pb-3">
            <div className="label-eyebrow flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Works with what you already use
            </div>
            <span className="font-mono text-[11px] text-ink-soft">LIVE</span>
          </div>
          <RevealGroup className="grid gap-4 sm:grid-cols-3" stagger={0.08}>
            {liveIntegrations.map((t) => (
              <RevealChild key={t.name} className="rule-t rule-b bg-background p-5 ledger-shadow">
                {t.icon && <t.icon className="h-5 w-5 text-accent" />}
                <div className="mt-4 font-serif text-lg tracking-[-0.01em]">{t.name}</div>
                <div className="mt-1 text-[12px] leading-relaxed text-ink-soft">{t.note}</div>
              </RevealChild>
            ))}
          </RevealGroup>

          {/* Tier 2 — policy admin systems (not live) */}
          <div className="mb-5 mt-10 flex items-baseline justify-between rule-b pb-3">
            <div className="label-eyebrow flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full border border-ink-soft bg-transparent" />
              Policy admin systems
            </div>
            <span className="inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-ink-soft" />
              <span className="font-mono text-[11px] text-ink-soft">PLANNED</span>
            </span>
          </div>
          <RevealGroup className="grid gap-4 sm:grid-cols-3" stagger={0.08}>
            {pasIntegrations.map((t) => (
              <RevealChild
                key={t.name}
                className="flex flex-col justify-between border border-dashed border-border bg-transparent p-5 text-ink-soft"
              >
                <div className="font-serif text-lg tracking-[-0.01em]">{t.name}</div>
                <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-none border border-border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  <span className="inline-block h-1 w-1 rounded-full bg-accent/70" />
                  {t.status}
                </span>
              </RevealChild>
            ))}
          </RevealGroup>

          <Reveal as="p" className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
            Policy admin system integrations are in development — Coverline works via email and
            spreadsheets today.
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Security() {
  const blocks = [
    {
      icon: ShieldCheck,
      title: "Human approval, always",
      body: "No recommendation reaches a broker or gets written back to your systems without explicit underwriter approval.",
    },
    {
      icon: ScrollText,
      title: "Full audit trail",
      body: "Every decision, every override, every source document — logged and traceable.",
    },
    {
      icon: FileText,
      title: "Built with security in mind",
      body: "Data encrypted at rest and in transit, role-based access controls.",
    },
  ];
  return (
    <section id="security" className="grain relative rule-t bg-foreground text-background">
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <div className="label-eyebrow flex items-center gap-3 !text-background/60">
            <span className="font-mono text-accent">05 /</span>
            <span>Security &amp; trust</span>
          </div>
          <Reveal as="h2" className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3rem]">
            Your underwriter is always in control.
          </Reveal>
        </div>
        {/*
          NOTE: Add specific compliance certifications only once actually
          obtained — do not state SOC 2 or similar unless true.
        */}
        <RevealGroup className="mt-14 grid gap-10 md:grid-cols-3" stagger={0.1}>
          {blocks.map(({ icon: Icon, title, body }) => (
            <RevealChild key={title} className="border-t border-background/20 pt-6">
              <Icon className="h-5 w-5 text-accent" />
              <div className="mt-5 font-serif text-2xl leading-snug tracking-[-0.01em]">
                {title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-background/70">{body}</p>
            </RevealChild>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

const faq = [
  {
    q: "Does the AI act on its own?",
    a: "No. Coverline reads documents, applies your rules, and drafts a recommendation — it never binds, declines, or writes anything to your systems without a human approving it first. Every recommendation sits in a review queue until an underwriter approves, edits, or overrides it, and every decision is logged with who approved it and when.",
  },
  {
    q: "How does it read documents?",
    a: "It extracts structured data from PDFs, scanned forms, Excel files, and emails using OCR and document classification tuned for insurance formats like ACORD applications and loss runs. Every extracted field is traceable back to the exact document it came from. If a document is too degraded to read reliably, it's routed to a manual review queue instead of guessing.",
  },
  {
    q: "Do I need a dedicated policy admin system to use it?",
    a: "No. Coverline runs on the tools you're already using — email, spreadsheets, and your CRM — so you can start without a policy admin system in place. If you do have one connected, approved actions can write back there directly.",
  },
  {
    q: "What happens if my policy admin system isn't connected?",
    a: "Everything still works. Coverline still reads submissions, applies your rules, and drafts recommendations — approved decisions are just recorded in a connected fallback like Google Sheets instead.",
  },
  {
    q: "Which MGA workflows does Coverline support today?",
    a: "Submission Triage, Renewal Management, and Broker Communication are available now. Endorsement processing, quoting support, and bind/issuance support are in active development. See the full roadmap above.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="rule-t">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-12 md:gap-10 md:px-8 md:py-28">
        <div className="md:col-span-4">
          <Eyebrow num="07 /">Questions</Eyebrow>
          <Reveal as="h2" className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[2.5rem]">
            Frequently asked.
          </Reveal>
        </div>
        <div className="md:col-span-8">
          <RevealGroup as="div" stagger={0.06}>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((f, i) => (
                <RevealChild key={i}>
                  <AccordionItem value={`item-${i}`} className="border-b border-border">
                    <AccordionTrigger className="py-6 text-left font-serif text-lg tracking-[-0.01em] hover:no-underline md:text-xl">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 text-base leading-relaxed text-ink-soft">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                </RevealChild>
              ))}
            </Accordion>
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const openDemo = useOpenDemo();
  return (
    <section id="demo" className="rule-t bg-secondary/60">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="max-w-3xl">
          <Eyebrow num="08 /">Get started</Eyebrow>
          <Reveal as="h2" className="mt-5 font-serif text-4xl leading-[1.02] tracking-[-0.02em] md:text-[4rem]">
            Give your underwriting team back their day.
          </Reveal>
          <Reveal as="p" delay={0.1} className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft">
            See how Submission Triage, Renewal Management, and Broker Communication run on your
            own book.
          </Reveal>
          <Reveal delay={0.2} className="mt-10">
            <PrimaryButton onClick={openDemo}>
              Book a demo <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="rule-t bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-12 md:px-8">
        <div className="md:col-span-6">
          <Wordmark />
          <p className="mt-4 max-w-sm text-sm text-ink-soft">
            The AI operating system for MGA underwriting.
          </p>
        </div>
        <div className="md:col-span-3">
          <div className="label-eyebrow mb-4">Product</div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#workflows" className="hover:text-accent">
                Workflows
              </a>
            </li>
            <li>
              <a href="#integrations" className="hover:text-accent">
                Integrations
              </a>
            </li>
            <li>
              <a href="#security" className="hover:text-accent">
                Security
              </a>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="label-eyebrow mb-4">Company</div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#about" className="hover:text-accent">
                About
              </a>
            </li>
            <li>
              <a href="#demo" className="hover:text-accent">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="rule-t">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-6 text-xs text-ink-soft md:flex-row md:px-8">
          <span>© 2026 Coverline. All rights reserved.</span>
          <span className="font-mono">MGA underwriting · v1</span>
        </div>
      </div>
    </footer>
  );
}

export function CoverlineLanding() {
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <OpenDemoContext.Provider value={() => setDemoOpen(true)}>
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <main>
          <Hero />
          <Problem />
          <HowItWorks />
          <Workflows />
          <Why />
          <Security />
          <Integrations />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </OpenDemoContext.Provider>
  );
}
