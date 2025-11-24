import { renderHook } from '@testing-library/react';

import { useLabels } from '~/client/hooks/useLabels';
import { useLocale } from '~/client/hooks/useLocale';

jest.mock('~/client/hooks/useLocale');
jest.mock('~/client/translations.json', () => ({
    Hello: {
        fr: 'Bonjour',
    },
    Partial: {
        fr: 'Partiel',
    },
}));

describe('useTranslations', () => {
    it('returns translated label when translations exist', () => {
        jest.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello')).toBe('Bonjour');
    });

    it('returns requested label when translations do not exist', () => {
        jest.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('NonExistent')).toBe('NonExistent');
    });

    it('returns translated label for specific locale when provided', () => {
        jest.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', 'fr')).toBe('Bonjour');
    });

    it('returns requested label when locale is not supported', () => {
        jest.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', 'de')).toBe('Hello');
    });

    it('returns requested label when locale is undefined', () => {
        jest.mocked(useLocale).mockReturnValue(undefined as any);
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello')).toBe('Hello');
    });

    it('returns requested label when overrideLocale is undefined and locale is undefined', () => {
        jest.mocked(useLocale).mockReturnValue(undefined as any);
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', undefined)).toBe('Hello');
    });

    it('returns requested label when translations[label] is undefined', () => {
        jest.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('NonExistent', 'fr')).toBe('NonExistent');
    });

    it('uses overrideLocale when provided', () => {
        jest.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', 'fr')).toBe('Bonjour');
    });

    it('uses locale when overrideLocale is not provided', () => {
        jest.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello')).toBe('Bonjour');
    });

    it('uses empty string when both overrideLocale and locale are falsy', () => {
        jest.mocked(useLocale).mockReturnValue(undefined as any);
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', '')).toBe('Hello');
    });

    it('returns label when translations[label] exists but translations[label][locale] is undefined', () => {
        jest.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Partial')).toBe('Partial');
    });

    it('returns label when translations[label] exists but translations[label][overrideLocale] is undefined', () => {
        jest.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Partial', 'en')).toBe('Partial');
    });
});
