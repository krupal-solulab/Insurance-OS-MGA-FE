import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Moon, Sun } from "lucide-react";

/* ============================================================
   Light / dark theme control.
   The initial class is set before paint by the inline script
   in __root.tsx; this hook reads/updates it and persists the
   choice to localStorage.
   ============================================================ */

type Theme = "light" | "dark";
const KEY = "coverline-theme";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  const apply = (t: Theme) => {
    setTheme(t);
    const root = document.documentElement;
    root.classList.toggle("dark", t === "dark");
    root.style.colorScheme = t;
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  };

  const toggle = () => apply(theme === "dark" ? "light" : "dark");
  return { theme, toggle, setTheme: apply };
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : undefined}
      className={`relative grid h-9 w-9 place-items-center overflow-hidden rounded-none border border-border text-ink-soft transition-colors hover:border-foreground/50 hover:text-foreground ${className}`}
    >
      <AnimatePresence initial={false} mode="wait">
        {mounted && (
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -35, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 35, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
