import { useCallback } from 'react';

import { useLocale } from '~/client/app/hooks/useLocale';
import translations from '~/client/app/translations.json';

export function useTranslations(): (label: string, overrideLocale?: string) => string | undefined {
    const locale = useLocale();
    return useCallback(
        (label: string, overrideLocale?: string) =>
            (translations as Record<string, Record<string, string>>)?.[label]?.[overrideLocale || locale || ''] ||
            undefined,
        [locale]
    );
}
