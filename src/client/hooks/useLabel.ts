import useTranslations from '~/client/hooks/useTranslations';

export default function useLabel(label: string, locale?: string): string {
    const translations = useTranslations();
    return translations(label, locale);
}
