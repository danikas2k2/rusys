import { renderHook } from '@testing-library/react';
import { useColorSchemeState } from '@ui/hooks/useColorSchemeState';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

jest.mock('@ui/hooks/useColorSchemeState');
jest.mock('@ui/hooks/usePreferredColorScheme');

describe('useDocumentColorScheme', () => {
    afterEach(() => jest.clearAllMocks());

    afterAll(() => {
        delete document.documentElement.dataset.colorScheme;
    });

    it('returns current color scheme when auto is true and current color scheme is not auto', () => {
        (useColorSchemeState as jest.Mock).mockReturnValue(['dark', jest.fn()]);
        (usePreferredColorScheme as jest.Mock).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(true));

        expect(result.current).toEqual('dark');
        expect(document.documentElement.dataset.colorScheme).toEqual('dark');
    });

    it('returns "auto" when auto is true and current color scheme is auto', () => {
        (useColorSchemeState as jest.Mock).mockReturnValue(['auto', jest.fn()]);
        (usePreferredColorScheme as jest.Mock).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(true));

        expect(result.current).toEqual('auto');
        expect(document.documentElement.dataset.colorScheme).toBeUndefined();
    });

    it('returns current color scheme when auto is false', () => {
        (useColorSchemeState as jest.Mock).mockReturnValue(['dark', jest.fn()]);
        (usePreferredColorScheme as jest.Mock).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(false));

        expect(result.current).toEqual('dark');
        expect(document.documentElement.dataset.colorScheme).toEqual('dark');
    });

    it('returns preferred color scheme when auto is false and current color scheme is auto', () => {
        (useColorSchemeState as jest.Mock).mockReturnValue(['auto', jest.fn()]);
        (usePreferredColorScheme as jest.Mock).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(false));

        expect(result.current).toEqual('light');
        expect(document.documentElement.dataset.colorScheme).toEqual('light');
    });

    it('removes color scheme from document when auto is true and current color scheme is auto', () => {
        (useColorSchemeState as jest.Mock).mockReturnValue(['auto', jest.fn()]);
        (usePreferredColorScheme as jest.Mock).mockReturnValue('light');
        document.documentElement.dataset.colorScheme = 'dark';

        renderHook(() => useDocumentColorScheme(true));

        expect(document.documentElement.dataset.colorScheme).toBeUndefined();
    });
});
