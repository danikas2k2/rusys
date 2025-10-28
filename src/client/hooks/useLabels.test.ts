import { renderHook } from '@testing-library/react';

import { useLabels } from '~/client/hooks/useLabels';
import { useLocale } from '~/client/hooks/useLocale';

jest.mock('~/client/hooks/useLocale');
jest.mock('~/client/translations.json', () => ({
    Hello: {
        fr: 'Bonjour',
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
});
