import { acceptLanguageForLocale, localeFromAcceptLanguage, savedLocale } from './locale';

describe('request locale selection', () => {
    it('uses the highest-priority supported language', () => {
        expect(localeFromAcceptLanguage('fr-FR,lt-LT;q=0.8,en-US;q=0.9')).toBe('en-US');
        expect(localeFromAcceptLanguage('en-US;q=0.5,lt;q=0.9')).toBe('lt-LT');
    });

    it('ignores disabled languages and falls back to English', () => {
        expect(localeFromAcceptLanguage('lt;q=0,en;q=0.5')).toBe('en-US');
        expect(localeFromAcceptLanguage('fr-FR,de-DE;q=0.8')).toBe('en-US');
        expect(localeFromAcceptLanguage(null)).toBe('en-US');
    });
});

describe('saved locale', () => {
    it('accepts supported values only', () => {
        expect(savedLocale('lt-LT')).toBe('lt-LT');
        expect(savedLocale('en-US')).toBe('en-US');
        expect(savedLocale('de-DE')).toBeUndefined();
    });

    it('sets the requested Accept-Language value', () => {
        expect(acceptLanguageForLocale('lt-LT')).toBe('lt-LT, en-US');
        expect(acceptLanguageForLocale('en-US')).toBe('en-US');
    });
});
