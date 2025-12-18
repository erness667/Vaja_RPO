"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { messages as slMessages } from "../../../locales/sl";
import { messages as enMessages } from "../../../locales/en";

export type AppLocale = "sl" | "en";

// Default locale for the app. You can later make this dynamic (e.g. from user
// settings, URL, or browser language).
const DEFAULT_LOCALE: AppLocale = "sl";

const catalogs: Record<AppLocale, typeof slMessages> = {
  sl: slMessages,
  en: enMessages,
};

// Load the default locale once so we have messages available on first render.
i18n.load(DEFAULT_LOCALE, catalogs[DEFAULT_LOCALE]);
i18n.activate(DEFAULT_LOCALE);

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

interface LinguiProviderProps {
  children: ReactNode;
}

export function LinguiProvider({ children }: LinguiProviderProps) {
  const [locale, setLocale] = useState<AppLocale>(DEFAULT_LOCALE);

  // On mount, try to restore the preferred locale from localStorage.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("app-locale");
    if (saved === "sl" || saved === "en") {
      setLocale(saved);
    }
  }, []);

  // Whenever locale changes, update Lingui and persist the preference.
  useEffect(() => {
    i18n.load(locale, catalogs[locale]);
    i18n.activate(locale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("app-locale", locale);
    }
  }, [locale]);

  return (
    <I18nProvider i18n={i18n}>
      <LocaleContext.Provider value={{ locale, setLocale }}>
        {children}
      </LocaleContext.Provider>
    </I18nProvider>
  );
}

export function useAppLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useAppLocale must be used within LinguiProvider");
  }
  return ctx;
}

