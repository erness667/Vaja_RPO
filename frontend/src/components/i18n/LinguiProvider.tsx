"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { messages as slMessages } from "../../../locales/sl";
import { messages as enMessages } from "../../../locales/en";

type AppLocale = "sl" | "en";

// Default locale for the app. You can later make this dynamic (e.g. from user
// settings, URL, or browser language).
const DEFAULT_LOCALE: AppLocale = "sl";

const catalogs: Record<AppLocale, typeof slMessages> = {
  sl: slMessages,
  en: enMessages,
};

i18n.load(DEFAULT_LOCALE, catalogs[DEFAULT_LOCALE]);
i18n.activate(DEFAULT_LOCALE);

interface LinguiProviderProps {
  children: ReactNode;
}

export function LinguiProvider({ children }: LinguiProviderProps) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}


