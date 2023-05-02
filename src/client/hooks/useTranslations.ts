import { useCallback } from 'react';
import translations from '~/client/translations.json';
import { type Locale } from '~/store/locale/types';
import useLocale from '~/store/locale/useLocale';

export default function useTranslations(): (label: string, overrideLocale?: Locale) => string {
    const locale = useLocale();
    return useCallback(
        (label: string, overrideLocale?: Locale) =>
            (translations as Record<string, Record<string, string>>)?.[label]?.[overrideLocale || locale || ''] ||
            label,
        [locale]
    );
}
