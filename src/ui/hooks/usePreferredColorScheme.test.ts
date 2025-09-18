import { renderHook } from '@testing-library/react';
import { mockWindow } from '@tests/mockWindow';

import { usePreferredColorScheme } from '@ui/hooks/usePreferredColorScheme';

describe('usePreferredColorScheme', () => {
    mockWindow();

    beforeAll(() => {
        jest.spyOn(window, 'matchMedia');
    });

    afterEach(() => jest.clearAllMocks());

    it('returns "dark" when system prefers dark color scheme', () => {
        jest.mocked(window.matchMedia).mockReturnValue({ matches: true } as MediaQueryList);
        const { result } = renderHook(() => usePreferredColorScheme());

        expect(result.current).toBe('dark');
    });

    it('returns "light" when system does not prefer dark color scheme', () => {
        jest.mocked(window.matchMedia).mockReturnValue({ matches: false } as MediaQueryList);
        const { result } = renderHook(() => usePreferredColorScheme());

        expect(result.current).toBe('light');
    });
});
