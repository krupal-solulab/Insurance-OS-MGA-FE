import { useState } from "react";
import { Menu, X, ArrowRight, FileText, ShieldCheck, ScrollText, Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const nav = [
  { label: "Product", href: "#how" },
  { label: "Workflows", href: "#workflows" },
  { label: "Why MGAs", href: "#why" },
  { label: "Security", href: "#security" },
];

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
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-none bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:bg-accent hover:text-accent-foreground ${className}`}
    >
      {children}
    </a>
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

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header id="top" className="sticky top-0 z-40 rule-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Wordmark />
        <nav className="hidden items-center gap-9 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-ink-soft transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="/app"
            className="text-sm text-ink-soft transition-colors hover:text-foreground"
          >
            Log in
          </a>
          <PrimaryButton>Book a demo</PrimaryButton>
        </div>
        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
            <a href="/app" className="py-2 text-sm text-foreground">
              Log in
            </a>
            <PrimaryButton className="mt-2">Book a demo</PrimaryButton>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <Eyebrow num="00 /">Built for MGAs</Eyebrow>
        <h1 className="mt-6 max-w-4xl font-serif text-[2.5rem] leading-[1.05] tracking-[-0.02em] text-foreground md:text-[4.25rem]">
          The AI operating system built for <em className="text-accent not-italic">MGA underwriting</em>.
        </h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
          Coverline reads every broker submission, checks it against your appetite, and drafts a
          recommendation — renewals, submissions, and broker communication, with your underwriter
          approving every decision.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-6">
          <PrimaryButton>
            Book a demo <ArrowRight className="h-4 w-4" />
          </PrimaryButton>
          <a
            href="#how"
            className="group inline-flex items-center gap-2 text-sm font-medium text-foreground"
          >
            See how it works
            <span className="h-px w-6 bg-foreground transition-all group-hover:w-10" />
          </a>
        </div>

        {/* Trust bar */}
        <div className="mt-16 grid gap-6 rule-t rule-b py-5 text-sm text-ink-soft md:grid-cols-3 md:divide-x md:divide-border md:gap-0">
          {[
            "Every recommendation cited to source",
            "Your underwriter approves every decision",
            "Built for MGAs, not carriers",
          ].map((t, i) => (
            <div key={i} className="md:px-6 first:md:pl-0">
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="rule-t bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 md:grid-cols-12 md:gap-10 md:px-8 md:py-28">
        <div className="md:col-span-5">
          <Eyebrow num="01 /">The problem</Eyebrow>
          <h2 className="mt-5 font-serif text-3xl leading-[1.1] tracking-[-0.01em] md:text-[2.75rem]">
            Submission triage shouldn't be the bottleneck.
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <p className="text-lg leading-relaxed text-ink-soft">
            MGAs write high submission volume with lean underwriting teams. Assistant underwriters
            spend 30%+ of their week reading documents — applications, loss runs, financials —
            before a senior underwriter even sees the account. Renewals repeat this every year,
            for every account already on the book.
          </p>

          {/* Documents in → decision out schematic */}
          <div className="mt-10 rule-t pt-8">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
              <div>
                <div className="label-eyebrow mb-3">Documents in</div>
                <div className="relative h-32">
                  {["ACORD 125", "Loss Run", "Financials", "Renewal Q"].map((d, i) => (
                    <div
                      key={d}
                      className="absolute left-0 flex h-8 w-full items-center gap-2 rule-b bg-background pl-3 text-xs text-ink-soft"
                      style={{
                        top: `${i * 14}px`,
                        transform: `translateX(${i * 6}px)`,
                        maxWidth: `calc(100% - ${i * 6}px)`,
                      }}
                    >
                      <FileText className="h-3.5 w-3.5 text-accent/70" />
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-ink-soft" />
              <div>
                <div className="label-eyebrow mb-3 text-right">Decision out</div>
                <div className="rule-t rule-b bg-background p-4">
                  <div className="label-eyebrow text-accent">Recommendation</div>
                  <div className="mt-1 font-serif text-lg">Proceed to quote</div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-soft">
                    <ShieldCheck className="h-3 w-3" />
                    Pending underwriter approval
                  </div>
                </div>
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
    body: "Coverline reads applications, loss runs, financials, and renewal questionnaires as they arrive.",
  },
  {
    n: "02",
    key: "Check",
    body: "Every submission is checked against your appetite rules, automatically.",
  },
  {
    n: "03",
    key: "Draft",
    body: "A recommendation is drafted — proceed, request more info, or decline — with every claim cited to its source document.",
  },
  {
    n: "04",
    key: "Approve",
    body: "Your underwriter reviews, edits if needed, and approves. Nothing moves forward without a human decision.",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="rule-t">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <Eyebrow num="02 /">How it works</Eyebrow>
          <h2 className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3.25rem]">
            AI drafts. <span className="text-ink-soft">Your underwriter decides.</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-px rule-t rule-b bg-border md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="bg-background p-6 md:p-8">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs text-accent">{s.n}</span>
                <span className="label-eyebrow">Step</span>
              </div>
              <div className="mt-6 font-serif text-2xl tracking-[-0.01em] md:text-3xl">
                {s.key}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Sample-view mock strip */}
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {/* 01 Read */}
          <div className="rule-t rule-b bg-secondary/50 p-5">
            <div className="label-eyebrow mb-3">Sample view · Read</div>
            <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
              <div className="bg-accent/15 px-1.5 py-0.5">
                Named Insured: <span className="text-accent">Riverbend Logistics LLC</span>
              </div>
              <div>Effective: 03/01/2026</div>
              <div className="bg-accent/15 px-1.5 py-0.5">
                TIV: <span className="text-accent">$14.2M</span>
              </div>
              <div>SIC: 4213 · Trucking</div>
              <div className="bg-accent/15 px-1.5 py-0.5">
                5-yr losses: <span className="text-accent">$482k / 11 claims</span>
              </div>
            </div>
          </div>
          {/* 02 Check */}
          <div className="rule-t rule-b bg-secondary/50 p-5">
            <div className="label-eyebrow mb-3">Sample view · Check</div>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-success" /> Class in appetite
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-success" /> Radius ≤ 500 mi
              </li>
              <li className="flex items-center gap-2 text-warn">
                <span className="inline-block h-2 w-2 bg-warn" /> Loss ratio flag: 42%
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-success" /> MVR complete
              </li>
            </ul>
          </div>
          {/* 03 Draft */}
          <div className="rule-t rule-b bg-secondary/50 p-5">
            <div className="label-eyebrow mb-3">Sample view · Draft</div>
            <div className="font-serif text-lg leading-snug">Proceed with quote, subject to MVR review.</div>
            <div className="mt-3 border-l-2 border-accent pl-2 text-[11px] text-ink-soft">
              Cited: Loss Run p.2, ACORD 125 §4
            </div>
          </div>
          {/* 04 Approve */}
          <div className="rule-t rule-b bg-secondary/50 p-5">
            <div className="label-eyebrow mb-3">Sample view · Approve</div>
            <div className="flex flex-col gap-2">
              <button className="rule-t rule-b bg-foreground py-2 text-xs font-medium text-background">
                Approve &amp; send
              </button>
              <button className="rule-t rule-b py-2 text-xs font-medium">Edit draft</button>
              <button className="py-2 text-xs text-ink-soft underline-offset-4 hover:underline">
                Override with note
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type Tier = { label: string; tone: "now" | "next" | "later"; items: [string, string?][] };

const tiers: Tier[] = [
  {
    label: "Available now",
    tone: "now",
    items: [
      ["Submission Triage", "Read, extract, and score every new submission against your appetite."],
      ["Renewal Management", "Compare every renewal against the prior term and flag what's changed."],
      [
        "Broker Communication",
        "Draft missing-info requests, quote summaries, and renewal explanations — you send.",
      ],
    ],
  },
  {
    label: "Coming next",
    tone: "next",
    items: [["Endorsement Processing"], ["Quoting & Rating Support"], ["Bind Order & Issuance Support"]],
  },
  {
    label: "On the roadmap",
    tone: "later",
    items: [["Appetite Governance & Audit"], ["Portfolio & Book Reporting"], ["Bordereau Reporting"]],
  },
];

function Workflows() {
  return (
    <section id="workflows" className="rule-t bg-secondary/60">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <Eyebrow num="03 /">Workflow suite</Eyebrow>
          <h2 className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3rem]">
            One workflow suite for the entire MGA lifecycle.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">
            Not a single point tool — the operating layer for how MGAs underwrite, renew, and
            communicate with brokers.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          {tiers.map((tier) => (
            <div key={tier.label}>
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
              <div className="grid gap-4 md:grid-cols-3">
                {tier.items.map(([title, desc]) => (
                  <div
                    key={title}
                    className={
                      tier.tone === "now"
                        ? "bg-foreground p-6 text-background"
                        : tier.tone === "next"
                          ? "border border-border bg-background p-6"
                          : "border border-dashed border-border bg-transparent p-6 text-ink-soft"
                    }
                  >
                    <div className="font-serif text-xl tracking-[-0.01em]">{title}</div>
                    {desc && (
                      <p
                        className={`mt-3 text-sm leading-relaxed ${
                          tier.tone === "now" ? "text-background/75" : "text-ink-soft"
                        }`}
                      >
                        {desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Why() {
  const cols = [
    {
      title: "MGA-native appetite logic",
      body: "Configured around how MGAs actually underwrite — lean teams, delegated authority, fast decisions — not retrofitted from enterprise carrier software.",
    },
    {
      title: "The full lifecycle, not one point tool",
      body: "Submission triage, renewals, and broker communication all run on the same core, so your data and decisions compound instead of living in five different tools.",
    },
    {
      title: "Runs on what you already use",
      body: "Email, spreadsheets, and your CRM — no dedicated policy admin system required to get started.",
    },
  ];
  return (
    <section id="why" className="rule-t">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <Eyebrow num="04 /">Why MGAs choose Coverline</Eyebrow>
          <h2 className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3rem]">
            Built for MGAs. Not adapted from a carrier platform.
          </h2>
        </div>
        <div className="mt-14 grid gap-px rule-t rule-b bg-border md:grid-cols-3">
          {cols.map((c, i) => (
            <div key={c.title} className="bg-background p-8">
              <span className="font-mono text-xs text-accent">
                0{i + 1}
              </span>
              <div className="mt-5 font-serif text-2xl leading-snug tracking-[-0.01em]">
                {c.title}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{c.body}</p>
            </div>
          ))}
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
    <section id="security" className="rule-t bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-3xl">
          <div className="label-eyebrow flex items-center gap-3 !text-background/60">
            <span className="font-mono text-accent">05 /</span>
            <span>Security &amp; trust</span>
          </div>
          <h2 className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[3rem]">
            Your underwriter is always in control.
          </h2>
        </div>
        {/*
          NOTE: Add specific compliance certifications only once actually
          obtained — do not state SOC 2 or similar unless true.
        */}
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {blocks.map(({ icon: Icon, title, body }) => (
            <div key={title} className="border-t border-background/20 pt-6">
              <Icon className="h-5 w-5 text-accent" />
              <div className="mt-5 font-serif text-2xl leading-snug tracking-[-0.01em]">
                {title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-background/70">{body}</p>
            </div>
          ))}
        </div>
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
          <Eyebrow num="06 /">Questions</Eyebrow>
          <h2 className="mt-5 font-serif text-3xl leading-[1.05] tracking-[-0.01em] md:text-[2.5rem]">
            Frequently asked.
          </h2>
        </div>
        <div className="md:col-span-8">
          <Accordion type="single" collapsible className="w-full">
            {faq.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border">
                <AccordionTrigger className="py-6 text-left font-serif text-lg tracking-[-0.01em] hover:no-underline md:text-xl">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-base leading-relaxed text-ink-soft">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section id="demo" className="rule-t bg-secondary/60">
      <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="max-w-3xl">
          <Eyebrow num="07 /">Get started</Eyebrow>
          <h2 className="mt-5 font-serif text-4xl leading-[1.02] tracking-[-0.02em] md:text-[4rem]">
            Give your underwriting team back their day.
          </h2>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft">
            See how Submission Triage, Renewal Management, and Broker Communication run on your
            own book.
          </p>
          <div className="mt-10">
            <PrimaryButton>
              Book a demo <ArrowRight className="h-4 w-4" />
            </PrimaryButton>
          </div>
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
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Workflows />
        <Why />
        <Security />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
