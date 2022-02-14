import { useTranslations } from '~/lang';

interface LabelProps {
    locale?: string;
    children: string;
}

export function Label({ children, locale }: LabelProps) {
    const translations = useTranslations();
    return <>{translations(children, locale)}</>;
}
