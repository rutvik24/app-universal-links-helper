"use client";

import { useEffect, useState } from "react";
import { Show } from "@/components/show";

const STORAGE_KEY = "app-links-helper-theme";

type Theme = "light" | "dark";

function readTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === "dark" || attr === "light") {
    return attr;
  }
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      className="action-btn shrink-0"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      <Show condition={isLight} fallback={<>Light</>}>
        Dark
      </Show>
    </button>
  );
}
