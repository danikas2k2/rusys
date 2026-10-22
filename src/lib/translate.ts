import { createTranslator } from 'use-intl/core';

import { savedLocale } from '~/lib/locale';
import { labelId, messagesForLocale } from '~/lib/messages';
import translations from '~/lib/translations.json';

const translators = {
    'en-US': createTranslator({ locale: 'en-US', messages: messagesForLocale('en-US') }),
    'lt-LT': createTranslator({ locale: 'lt-LT', messages: messagesForLocale('lt-LT') }),
};

export function translate(label: string, locale: string): string {
    const id = labelId(label);
    const supportedLocale = savedLocale(locale);
    if (id && supportedLocale) {
        return translators[supportedLocale].raw(`labels.${id}`) as string;
    }
    return (translations as Record<string, Record<string, string>>)[label]?.[locale] || label;
}
