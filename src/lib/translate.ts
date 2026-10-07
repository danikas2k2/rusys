import translations from '~/lib/translations.json';

export function translate(label: string, locale: string): string {
    return (translations as Record<string, Record<string, string>>)[label]?.[locale] || label;
}
