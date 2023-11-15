import { renderHook } from '@testing-library/react';
import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

describe('usePreferredColorScheme', () => {
    beforeAll(() => {
        window.matchMedia = jest.fn();
    });

    afterAll(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete window.matchMedia;
    });

    afterEach(() => jest.clearAllMocks());

    it('returns "dark" when system prefers dark color scheme', () => {
        (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });
        const { result } = renderHook(() => usePreferredColorScheme());
        expect(result.current).toEqual('dark');
    });

    it('returns "light" when system does not prefer dark color scheme', () => {
        (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });
        const { result } = renderHook(() => usePreferredColorScheme());
        expect(result.current).toEqual('light');
    });
});
