export type AppLocale = 'en-US' | 'lt-LT';

export const DEFAULT_LOCALE: AppLocale = 'en-US';
export const LOCALE_COOKIE = 'rusys-locale';

export function savedLocale(value: string | undefined): AppLocale | undefined {
    return value === 'lt-LT' || value === 'en-US' ? value : undefined;
}

export function acceptLanguageForLocale(locale: AppLocale): string {
    return locale === 'lt-LT' ? 'lt-LT, en-US' : 'en-US';
}

export function localeFromAcceptLanguage(value: string | null): AppLocale {
    const preferences = (value ?? '')
        .split(',')
        .map((entry) => {
            const [language, qualityParameter] = entry.trim().split(';');
            const quality = qualityParameter?.trim().match(/^q=(0(?:\.\d+)?|1(?:\.0+)?)$/i)?.[1];
            return {
                language: language.toLowerCase(),
                quality: qualityParameter === undefined ? 1 : Number(quality ?? 0),
            };
        })
        .sort((a, b) => b.quality - a.quality);

    for (const { language, quality } of preferences) {
        if (quality === 0) {
            continue;
        }
        if (language === 'lt' || language.startsWith('lt-')) {
            return 'lt-LT';
        }
        if (language === 'en' || language.startsWith('en-')) {
            return 'en-US';
        }
    }

    return DEFAULT_LOCALE;
}
