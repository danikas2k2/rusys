import { prefersReducedMotion } from './motion';

describe('prefersReducedMotion', () => {
    it('reads the current reduced-motion media query', () => {
        const originalMatchMedia = window.matchMedia.bind(window);
        let reduce = false;
        const matchMedia = vi.fn((query: string) => ({
            ...originalMatchMedia(query),
            matches: reduce,
        }));
        window.matchMedia = matchMedia;

        try {
            expect(prefersReducedMotion()).toBe(false);

            reduce = true;

            expect(prefersReducedMotion()).toBe(true);
            expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
            expect(matchMedia).toHaveBeenCalledTimes(2);
        } finally {
            window.matchMedia = originalMatchMedia;
        }
    });

    it('returns false when called without a browser window', () => {
        vi.stubGlobal('window', undefined);

        try {
            expect(prefersReducedMotion()).toBe(false);
        } finally {
            vi.unstubAllGlobals();
        }
    });
});
