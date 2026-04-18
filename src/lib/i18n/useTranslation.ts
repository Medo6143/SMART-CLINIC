/**
 * Web i18n utility — simple hook wrapping translation files.
 * For full next-intl integration, configure in next.config.ts + middleware.
 * This is a lightweight approach for initial development.
 */

import en from "./en.json";
import ar from "./ar.json";
import { useState, useCallback, useMemo } from "react";

type TranslationKeys = typeof en;
type Language = "en" | "ar";

const translations: Record<Language, TranslationKeys> = { en, ar };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === "string" ? current : path;
}

export function useTranslation() {
  const [language, setLanguage] = useState<Language>("en");
  const isRTL = language === "ar";

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations[language] as unknown as Record<string, unknown>, key);
    },
    [language]
  );

  const changeLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next = prev === "en" ? "ar" : "en";
      if (typeof document !== "undefined") {
        document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = next;
      }
      return next;
    });
  }, []);

  return useMemo(
    () => ({ t, language, isRTL, changeLanguage, toggleLanguage }),
    [t, language, isRTL, changeLanguage, toggleLanguage]
  );
}
