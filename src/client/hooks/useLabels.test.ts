import { renderHook } from '@testing-library/react';

import { useLabels } from '~/client/hooks/useLabels';
import { useLocale } from '~/client/hooks/useLocale';

vi.mock('~/client/hooks/useLocale');
vi.mock('~/client/translations.json', async () => ({
    default: {
        Hello: {
            fr: 'Bonjour',
        },
        Partial: {
            fr: 'Partiel',
        },
    },
}));

describe('useTranslations', () => {
    it('returns translated label when translations exist', () => {
        vi.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello')).toBe('Bonjour');
    });

    it('returns requested label when translations do not exist', () => {
        vi.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('NonExistent')).toBe('NonExistent');
    });

    it('returns translated label for specific locale when provided', () => {
        vi.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', 'fr')).toBe('Bonjour');
    });

    it('returns requested label when locale is not supported', () => {
        vi.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', 'de')).toBe('Hello');
    });

    it('returns requested label when locale is undefined', () => {
        vi.mocked(useLocale).mockReturnValue(undefined as any);
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello')).toBe('Hello');
    });

    it('returns requested label when overrideLocale is undefined and locale is undefined', () => {
        vi.mocked(useLocale).mockReturnValue(undefined as any);
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', undefined)).toBe('Hello');
    });

    it('returns requested label when translations[label] is undefined', () => {
        vi.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('NonExistent', 'fr')).toBe('NonExistent');
    });

    it('uses overrideLocale when provided', () => {
        vi.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', 'fr')).toBe('Bonjour');
    });

    it('uses locale when overrideLocale is not provided', () => {
        vi.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello')).toBe('Bonjour');
    });

    it('uses empty string when both overrideLocale and locale are falsy', () => {
        vi.mocked(useLocale).mockReturnValue(undefined as any);
        const { result } = renderHook(() => useLabels());

        expect(result.current('Hello', '')).toBe('Hello');
    });

    it('returns label when translations[label] exists but translations[label][locale] is undefined', () => {
        vi.mocked(useLocale).mockReturnValue('en');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Partial')).toBe('Partial');
    });

    it('returns label when translations[label] exists but translations[label][overrideLocale] is undefined', () => {
        vi.mocked(useLocale).mockReturnValue('fr');
        const { result } = renderHook(() => useLabels());

        expect(result.current('Partial', 'en')).toBe('Partial');
    });
});
