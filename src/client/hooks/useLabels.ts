import { useCallback } from 'react';

import { useLocale } from '~/client/hooks/useLocale';
import translations from '~/client/translations.json';

export function useLabels(): (label: string, overrideLocale?: string) => string | undefined {
    const locale = useLocale();
    return useCallback(
        (label: string, overrideLocale?: string) =>
            (translations as Record<string, Record<string, string>>)?.[label]?.[overrideLocale || locale || ''] ||
            label,
        [locale]
    );
}
