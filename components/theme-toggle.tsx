"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "app-links-helper-theme";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark" || attr === "light") {
    return attr;
  }
  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  if (!mounted) return <div className="h-8 w-16 rounded-full bg-[var(--surface-subtle)]" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      className="relative flex h-8 items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 text-xs font-medium transition-colors hover:border-[var(--line-strong)]"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="flex items-center gap-1 px-1.5 py-0.5">
        <svg
          className={`size-3.5 transition-colors ${!isDark ? "text-amber-500 font-bold" : "text-[var(--muted)]"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span className={`text-[10px] font-semibold tracking-wider ${!isDark ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
          LIGHT
        </span>
      </div>

      <div className="flex items-center gap-1 px-1.5 py-0.5">
        <svg
          className={`size-3.5 transition-colors ${isDark ? "text-sky-400 font-bold" : "text-[var(--muted)]"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
        <span className={`text-[10px] font-semibold tracking-wider ${isDark ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}>
          DARK
        </span>
      </div>
    </button>
  );
}
