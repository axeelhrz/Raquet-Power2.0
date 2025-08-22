import { useRouter } from 'next/router';
import es from '@/locales/es.json';
import en from '@/locales/en.json';

type TranslationKey = string;
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

const translations: Record<string, Translations> = {
  es: es as Translations,
  en: en as Translations,
};

export function useTranslation() {
  const router = useRouter();
  const { locale = 'es' } = router;

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: TranslationValue | undefined = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        value = (value as { [key: string]: TranslationValue })[k];
      } else {
        // Fallback to Spanish if key not found
        value = translations['es'];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            value = (value as { [key: string]: TranslationValue })[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, locale };
}