import { useCallback } from 'react';
import translations from '~/client/translations.json';
import { type Locale } from '~/state/locale/types';
import { useLocale } from '~/state/locale/useLocale';

export function useTranslations(): (label: string, overrideLocale?: Locale) => string | undefined {
    const locale = useLocale();
    return useCallback(
        (label: string, overrideLocale?: Locale) =>
            (translations as Record<string, Record<string, string>>)?.[label]?.[overrideLocale || locale || ''] ||
            undefined,
        [locale]
    );
}
