import { useTranslations } from '~/client/app/hooks/useTranslations';

export function useLabel(label: string, locale?: string): string {
    const translations = useTranslations();
    return translations(label, locale) ?? label;
}
