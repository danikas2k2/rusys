import { useCallback } from 'react';

import { useLocale } from '~/lib/hooks/useLocale';
import { translate } from '~/lib/translate';

export function useLabels(): (label: string, overrideLocale?: string) => string {
    const locale = useLocale();
    return useCallback(
        (label: string, overrideLocale?: string) => translate(label, overrideLocale || locale || ''),
        [locale]
    );
}
