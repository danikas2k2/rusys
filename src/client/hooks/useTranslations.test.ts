import { renderHook } from '@testing-library/react';
import { useTranslations } from '~/client/hooks/useTranslations';
import { useLocale } from '~/state/locale/useLocale';

jest.mock('~/state/locale/useLocale');
jest.mock('~/client/translations.json', () => ({
    Hello: {
        fr: 'Bonjour',
    },
}));

describe('useTranslations', () => {
    it('returns translated label when translations exist', () => {
        (useLocale as jest.Mock).mockReturnValue('fr');
        const { result } = renderHook(() => useTranslations());
        expect(result.current('Hello')).toBe('Bonjour');
    });

    it('returns undefined when translations do not exist', () => {
        (useLocale as jest.Mock).mockReturnValue('fr');
        const { result } = renderHook(() => useTranslations());
        expect(result.current('NonExistent')).toBeUndefined();
    });

    it('returns translated label for specific locale when provided', () => {
        (useLocale as jest.Mock).mockReturnValue('en');
        const { result } = renderHook(() => useTranslations());
        expect(result.current('Hello', 'fr')).toBe('Bonjour');
    });

    it('returns undefined when locale is not supported', () => {
        (useLocale as jest.Mock).mockReturnValue('en');
        const { result } = renderHook(() => useTranslations());
        expect(result.current('Hello', 'de')).toBeUndefined();
    });
});
