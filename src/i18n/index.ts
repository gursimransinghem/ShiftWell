import { en } from './en';
import { es } from './es';
import { getLocales } from 'expo-localization';

type SupportedLocale = 'en' | 'es';

const translations: Record<SupportedLocale, Record<string, unknown>> = { en, es };

/**
 * Detect the device locale and return a supported locale code.
 * Returns 'es' for any Spanish variant (es-US, es-MX, es-419, etc.).
 * Falls back to 'en' for all other locales.
 */
export function getLocale(): SupportedLocale {
  const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
  return deviceLocale.startsWith('es') ? 'es' : 'en';
}

/**
 * Resolve a dot-notation key against a translation map.
 * Example: resolvePath('today.recoveryScore', en) → "Recovery Score"
 * Returns undefined if path is missing.
 */
function resolvePath(key: string, obj: Record<string, unknown>): string | undefined {
  const parts = key.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Translate a dot-notation key.
 * - Uses device locale (Spanish or English).
 * - Falls back to English if the key is missing in Spanish.
 * - Returns the key itself if not found in either locale (visible in UI for debugging).
 *
 * @param key - Dot-notation path, e.g. 'today.recoveryScore'
 * @returns Translated string
 */
export function t(key: string): string {
  const locale = getLocale();
  const localeMap = translations[locale] as unknown as Record<string, unknown>;
  const enMap = translations['en'] as unknown as Record<string, unknown>;

  const localeResult = resolvePath(key, localeMap);
  if (localeResult !== undefined) return localeResult;

  // Fallback to English
  const enResult = resolvePath(key, enMap);
  if (enResult !== undefined) return enResult;

  // Return key as last resort (debugging aid)
  return key;
}

/**
 * React hook for translations.
 * Returns { t, locale } — t() is pre-bound with current locale.
 * Locale is stable within a session (device language doesn't change mid-session).
 */
export function useTranslation(): { t: (key: string) => string; locale: SupportedLocale } {
  const locale = getLocale();
  return { t, locale };
}

// Legacy i18n-js compatibility export (for any existing callers using i18n.t())
export const i18n = {
  t,
  locale: getLocale(),
};

export default i18n;
