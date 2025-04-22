import { renderHook } from '@testing-library/react';
import { useLocale } from '~/client/hooks/useLocale';
import { useTranslations } from '~/client/hooks/useTranslations';

jest.mock('~/client/hooks/useLocale');
jest.mock('~/client/translations.json', () => ({
    Hello: {
        fr: 'Bonjour',
    },
}));

describe('useTranslations', () => {
    it('returns translated label when translations exist', () => {
        jest.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useTranslations());

        expect(result.current('Hello')).toBe('Bonjour');
    });

    it('returns undefined when translations do not exist', () => {
        jest.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useTranslations());

        expect(result.current('NonExistent')).toBeUndefined();
    });

    it('returns translated label for specific locale when provided', () => {
        jest.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useTranslations());

        expect(result.current('Hello', 'fr')).toBe('Bonjour');
    });

    it('returns undefined when locale is not supported', () => {
        jest.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useTranslations());

        expect(result.current('Hello', 'de')).toBeUndefined();
    });
});
