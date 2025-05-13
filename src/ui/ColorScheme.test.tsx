import { use } from 'react';
import { act, renderHook } from '@testing-library/react';
import { mockLocalStorage } from '@tests/mockLocalStorage';
import { COLOR_SCHEME_KEY, ColorSchemeContext, ColorSchemeState } from '@ui/ColorScheme';

describe('<ColorSchemeState>', () => {
    const localStorage = mockLocalStorage();

    afterEach(() => localStorage.clear());

    it('initializes with auto color scheme', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), { wrapper: ColorSchemeState });
        const [colorScheme] = result.current;

        expect(colorScheme).toBe('auto');
    });

    it('initializes with stored color scheme', () => {
        localStorage.setItem(COLOR_SCHEME_KEY, 'dark');
        const { result } = renderHook(() => use(ColorSchemeContext), { wrapper: ColorSchemeState });
        const [colorScheme] = result.current;

        expect(colorScheme).toBe('dark');
    });

    it('updates color scheme', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), { wrapper: ColorSchemeState });
        const [, setColorScheme] = result.current;
        act(() => setColorScheme('light'));
        const [colorScheme] = result.current;

        expect(colorScheme).toBe('light');
    });

    it('stores color scheme', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), { wrapper: ColorSchemeState });
        const [, setColorScheme] = result.current;
        act(() => setColorScheme('dark'));

        expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('dark');
    });

    it('removes stored color scheme when set to auto', () => {
        localStorage.setItem(COLOR_SCHEME_KEY, 'dark');
        const { result } = renderHook(() => use(ColorSchemeContext), { wrapper: ColorSchemeState });
        const [, setColorScheme] = result.current;
        act(() => setColorScheme('auto'));

        expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBeNull();
    });

    it('updates color scheme on storage event', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), { wrapper: ColorSchemeState });
        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: COLOR_SCHEME_KEY,
                    newValue: 'light',
                })
            );
        });
        const [colorScheme] = result.current;

        expect(colorScheme).toBe('light');
    });
});
