import { renderHook } from '@testing-library/react';

import { useMantineColorScheme } from '@mantine/core';

import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

jest.mock('@mantine/core');
jest.mock('@ui/hooks/usePreferredColorScheme');

describe('useDocumentColorScheme', () => {
    const mockMantineColorScheme: ReturnType<typeof useMantineColorScheme> = {
        colorScheme: 'auto',
        setColorScheme: jest.fn(),
        toggleColorScheme: jest.fn(),
        clearColorScheme: jest.fn(),
    };

    beforeEach(() => {
        jest.mocked(useMantineColorScheme).mockReturnValue(mockMantineColorScheme);
    });

    afterEach(() => jest.clearAllMocks());

    it('returns current color scheme when auto is true and current color scheme is not auto', () => {
        jest.mocked(useMantineColorScheme).mockReturnValue({ ...mockMantineColorScheme, colorScheme: 'dark' });
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(true));

        expect(result.current).toBe('dark');
        expect(document.documentElement.dataset.colorScheme).toBe('dark');
    });

    it('returns current color scheme when auto is not defined and current color scheme is not auto', () => {
        jest.mocked(useMantineColorScheme).mockReturnValue({ ...mockMantineColorScheme, colorScheme: 'dark' });
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme());

        expect(result.current).toBe('dark');
        expect(document.documentElement.dataset.colorScheme).toBe('dark');
    });

    it('returns "auto" when auto is true and current color scheme is auto', () => {
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(true));

        expect(result.current).toBe('auto');
        expect(document.documentElement.dataset.colorScheme).toBeUndefined();
    });

    it('returns "auto" when auto is not defined and current color scheme is auto', () => {
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme());

        expect(result.current).toBe('auto');
        expect(document.documentElement.dataset.colorScheme).toBeUndefined();
    });

    it('returns current color scheme when auto is false', () => {
        jest.mocked(useMantineColorScheme).mockReturnValue({ ...mockMantineColorScheme, colorScheme: 'dark' });
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(false));

        expect(result.current).toBe('dark');
        expect(document.documentElement.dataset.colorScheme).toBe('dark');
    });

    it('returns preferred color scheme when auto is false and current color scheme is auto', () => {
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');

        const { result } = renderHook(() => useDocumentColorScheme(false));

        expect(result.current).toBe('light');
        expect(document.documentElement.dataset.colorScheme).toBe('light');
    });

    it('removes color scheme from document when auto is true and current color scheme is auto', () => {
        jest.mocked(usePreferredColorScheme).mockReturnValue('light');
        jest.spyOn(document.documentElement, 'dataset', 'get').mockReturnValue({ colorScheme: 'dark' });

        renderHook(() => useDocumentColorScheme(true));

        expect(document.documentElement.dataset.colorScheme).toBeUndefined();
    });
});
