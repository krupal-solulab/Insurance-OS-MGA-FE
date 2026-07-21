import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";

/* ============================================================
   Shared scroll-reveal primitives for the marketing page.
   All animation is transform/opacity only and respects
   prefers-reduced-motion (falls back to no movement).
   ============================================================ */

const EASE = [0.22, 1, 0.36, 1] as const;

/** A single element that fades + slides in once when scrolled into view. */
export function Reveal({
  children,
  className = "",
  y = 24,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  as?: "div" | "section" | "li" | "span" | "h1" | "h2" | "p";
}) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Container that staggers its <RevealChild> descendants as the group enters view. */
export function RevealGroup({
  children,
  className = "",
  stagger = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "section";
}) {
  const reduce = useReducedMotion();
  const M = motion[as] as typeof motion.div;
  return (
    <M
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </M>
  );
}

const childVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function RevealChild({
  children,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const M = motion[as] as typeof motion.div;
  return (
    <M className={className} variants={childVariants}>
      {children}
    </M>
  );
}

/** Word/line-by-line headline reveal. Pass an array of lines. */
export function RevealLines({
  lines,
  className = "",
}: {
  lines: ReactNode[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className="block"
            initial={reduce ? false : { y: "110%" }}
            animate={reduce ? undefined : { y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
