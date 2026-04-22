/**
 * Web i18n utility — simple hook wrapping translation files.
 * Uses global LanguageProvider for shared state across components.
 */

import en from "./en.json";
import ar from "./ar.json";
import { useCallback, useMemo } from "react";
import { useLanguage } from "@/providers/LanguageProvider";

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
  const { language, isRTL, setLanguage, toggleLanguage } = useLanguage();

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const value = getNestedValue(translations[language] as unknown as Record<string, unknown>, key);
      // Return fallback if provided and key not found (value equals key)
      if (fallback && value === key) {
        return fallback;
      }
      return value;
    },
    [language]
  );

  const changeLanguage = useCallback(
    (lang: Language) => {
      setLanguage(lang);
    },
    [setLanguage]
  );

  return useMemo(
    () => ({ t, language, isRTL, changeLanguage, toggleLanguage }),
    [t, language, isRTL, changeLanguage, toggleLanguage]
  );
}
