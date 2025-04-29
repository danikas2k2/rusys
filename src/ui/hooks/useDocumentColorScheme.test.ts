import { renderHook } from '@testing-library/react';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

jest.mock('@ui/hooks/useColorSchemeState');
jest.mock('@ui/hooks/usePreferredColorScheme');

describe('useDocumentColorScheme', () => {
    afterEach(() => jest.clearAllMocks());

    it('returns current color scheme when auto is true and current color scheme is not auto', () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['dark', jest.fn()]);
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(true));

        expect(result.current).toBe('dark');
        expect(document.documentElement.dataset.colorScheme).toBe('dark');
    });

    it('returns "auto" when auto is true and current color scheme is auto', () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['auto', jest.fn()]);
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(true));

        expect(result.current).toBe('auto');
        expect(document.documentElement.dataset.colorScheme).toBeUndefined();
    });

    it('returns current color scheme when auto is false', () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['dark', jest.fn()]);
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(false));

        expect(result.current).toBe('dark');
        expect(document.documentElement.dataset.colorScheme).toBe('dark');
    });

    it('returns preferred color scheme when auto is false and current color scheme is auto', () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['auto', jest.fn()]);
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(false));

        expect(result.current).toBe('light');
        expect(document.documentElement.dataset.colorScheme).toBe('light');
    });

    it('removes color scheme from document when auto is true and current color scheme is auto', () => {
        jest.mocked(useColorSchemeState).mockReturnValue(['auto', jest.fn()]);
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');
        jest.spyOn(document.documentElement, 'dataset', 'get').mockReturnValue({ colorScheme: 'dark' });

        renderHook(() => useDocumentColorScheme(true));

        expect(document.documentElement.dataset.colorScheme).toBeUndefined();
    });
});
