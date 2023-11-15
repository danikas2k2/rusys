import { renderHook } from '@testing-library/react';
import { useLabel } from '~/client/hooks/useLabel';
import { useTranslations } from '~/client/hooks/useTranslations';

jest.mock('~/client/hooks/useTranslations');

describe('useLabel', () => {
    const translations = jest.fn();

    beforeAll(() =>
        (useTranslations as jest.Mock).mockReturnValue(
            translations.mockImplementation((label, locale) => (locale === 'fr' ? 'Label Traduit' : label))
        )
    );

    afterEach(() => jest.clearAllMocks());

    it('returns translated label when translations exist', () => {
        translations.mockReturnValueOnce('Translated Label');
        const { result } = renderHook(() => useLabel('Label'));
        expect(result.current).toBe('Translated Label');
    });

    it('returns original label when translations do not exist', () => {
        translations.mockReturnValueOnce(null);
        const { result } = renderHook(() => useLabel('Label'));
        expect(result.current).toBe('Label');
    });

    it('returns translated label for specific locale when provided', () => {
        const { result } = renderHook(() => useLabel('Label', 'fr'));
        expect(result.current).toBe('Label Traduit');
    });

    it('returns original label when locale is not supported', () => {
        const { result } = renderHook(() => useLabel('Label', 'de'));
        expect(result.current).toBe('Label');
    });
});
