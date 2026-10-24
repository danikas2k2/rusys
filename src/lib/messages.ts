import type { AppLocale } from '~/lib/locale';
import translations from '~/lib/translations.json';

const dictionary = translations as Record<string, Record<string, string>>;
const entries = Object.entries(dictionary);
const labelIds = new Map(entries.map(([label], index) => [label, String(index)]));

export function labelId(label: string): string | undefined {
    return labelIds.get(label);
}

export function messagesForLocale(locale: AppLocale) {
    return {
        labels: Object.fromEntries(
            entries.map(([label, values], index) => [
                String(index),
                locale === 'lt-LT' ? (values['lt-LT'] ?? label) : label,
            ])
        ),
        shell: {
            switchToEnglish:
                locale === 'lt-LT'
                    ? (dictionary['Switch to English']?.['lt-LT'] ?? 'Switch to English')
                    : 'Switch to English',
            switchToLithuanian:
                locale === 'lt-LT'
                    ? (dictionary['Switch to Lithuanian']?.['lt-LT'] ?? 'Switch to Lithuanian')
                    : 'Switch to Lithuanian',
        },
    };
}
