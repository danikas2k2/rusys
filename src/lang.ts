import { useLocale } from '~/store/locale.selectors';
import { Locale } from '~/store/locale.types';
import translations from '~/translations.json';

export function useTranslations() {
    const locale = useLocale();
    return (label: string, overrideLocale?: Locale) => (
        (translations as any)?.[label]?.[overrideLocale || locale || ''] || label
    );
}
