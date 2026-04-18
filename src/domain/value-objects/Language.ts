export const Languages = {
  ENGLISH: "en",
  ARABIC: "ar",
} as const;

export type Language = (typeof Languages)[keyof typeof Languages];

export function isRTL(lang: Language): boolean {
  return lang === Languages.ARABIC;
}

export function getDirection(lang: Language): "ltr" | "rtl" {
  return isRTL(lang) ? "rtl" : "ltr";
}

export function getFontFamily(lang: Language): string {
  return isRTL(lang) ? "'Cairo', sans-serif" : "'Inter', sans-serif";
}
