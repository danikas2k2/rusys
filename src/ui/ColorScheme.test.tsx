import { act, renderHook } from '@testing-library/react';
import { COLOR_SCHEME_KEY, ColorSchemeContext } from '@ui/ColorScheme';
import { use } from 'react';
import { mockLocalStorage } from '~/tests/mockLocalStorage';
import { withColorState } from '~/tests/withColorState';

describe('ColorSchemeState', () => {
    const localStorage = mockLocalStorage();

    afterEach(() => {
        localStorage.clear();
    });

    it('initializes with auto color scheme', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), withColorState());
        const [colorScheme] = result.current;
        expect(colorScheme).toEqual('auto');
    });

    it('initializes with stored color scheme', () => {
        localStorage.setItem(COLOR_SCHEME_KEY, 'dark');
        const { result } = renderHook(() => use(ColorSchemeContext), withColorState());
        const [colorScheme] = result.current;
        expect(colorScheme).toEqual('dark');
    });

    it('updates color scheme', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), withColorState());
        const [, setColorScheme] = result.current;
        act(() => setColorScheme('light'));
        const [colorScheme] = result.current;
        expect(colorScheme).toEqual('light');
    });

    it('stores color scheme', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), withColorState());
        const [, setColorScheme] = result.current;
        act(() => setColorScheme('dark'));
        expect(localStorage.getItem(COLOR_SCHEME_KEY)).toEqual('dark');
    });

    it('removes stored color scheme when set to auto', () => {
        localStorage.setItem(COLOR_SCHEME_KEY, 'dark');
        const { result } = renderHook(() => use(ColorSchemeContext), withColorState());
        const [, setColorScheme] = result.current;
        act(() => setColorScheme('auto'));
        expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBeNull();
    });

    it('updates color scheme on storage event', () => {
        const { result } = renderHook(() => use(ColorSchemeContext), withColorState());
        act(() => {
            window.dispatchEvent(
                new StorageEvent('storage', {
                    key: COLOR_SCHEME_KEY,
                    newValue: 'light',
                })
            );
        });
        const [colorScheme] = result.current;
        expect(colorScheme).toEqual('light');
    });
});
