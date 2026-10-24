"use client";

import React, { createContext, useContext } from "react";
import { id } from "./dictionaries/id";
import { en } from "./dictionaries/en";

export type Locale = "id" | "en";
export type Dictionary = typeof id;

interface I18nContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: Dictionary;
}

const dictionaries: Record<Locale, Dictionary> = { id, en };

const I18nContext = createContext<I18nContextType>({
  locale: "id",
  setLocale: () => {},
  t: id,
});

const LOCALE_EVENT = "muaraku_locale_change";

function subscribeLocale(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCALE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCALE_EVENT, callback);
  };
}

function getLocaleSnapshot(): Locale {
  if (typeof window === "undefined") return "id";
  const saved = localStorage.getItem("muaraku_locale");
  return saved === "en" ? "en" : "id";
}

function getServerLocaleSnapshot(): Locale {
  return "id";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = React.useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getServerLocaleSnapshot);

  const setLocale = (loc: Locale) => {
    localStorage.setItem("muaraku_locale", loc);
    window.dispatchEvent(new Event(LOCALE_EVENT));
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: dictionaries[locale] || id,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
