import { useCallback } from 'react';

import { useLocale } from '~/lib/hooks/useLocale';
import translations from '~/lib/translations.json';

export function useLabels(): (label: string, overrideLocale?: string) => string {
    const locale = useLocale();
    return useCallback(
        (label: string, overrideLocale?: string) =>
            (translations as Record<string, Record<string, string>>)?.[label]?.[overrideLocale || locale || ''] ||
            label,
        [locale]
    );
}
