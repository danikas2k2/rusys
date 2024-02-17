import { useCallback } from 'react';
import translations from '~/client/translations.json';
import { useLocale } from '~/state/locale/useLocale';

export function useTranslations(): (label: string, overrideLocale?: string) => string | undefined {
    const locale = useLocale();
    return useCallback(
        (label: string, overrideLocale?: string) =>
            (translations as Record<string, Record<string, string>>)?.[label]?.[overrideLocale || locale || ''] ||
            undefined,
        [locale]
    );
}
