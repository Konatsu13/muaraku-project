"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

const THEME_EVENT = "muaraku_theme_change";

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === "undefined") return "system";
  const saved = localStorage.getItem("muaraku_theme") as Theme | null;
  return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
}

function getServerThemeSnapshot(): Theme {
  return "system";
}

function subscribeMedia(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getMediaSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerMediaSnapshot(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  const isSystemDark = useSyncExternalStore(subscribeMedia, getMediaSnapshot, getServerMediaSnapshot);

  const resolvedTheme: "light" | "dark" =
    theme === "dark" ? "dark" : theme === "light" ? "light" : isSystemDark ? "dark" : "light";

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setTheme = (t: Theme) => {
    localStorage.setItem("muaraku_theme", t);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
