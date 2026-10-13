import { supportsClippedViewTransitions } from './supportsClippedViewTransitions';

describe('supportsClippedViewTransitions', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('returns false without a document', () => {
        vi.stubGlobal('document', undefined);

        expect(supportsClippedViewTransitions()).toBe(false);
    });

    it('returns false without the document view transition API', () => {
        const supports = vi.fn();
        vi.stubGlobal('document', {});
        vi.stubGlobal('CSS', { supports });

        expect(supportsClippedViewTransitions()).toBe(false);
        expect(supports).not.toHaveBeenCalled();
    });

    it('returns false without the CSS API', () => {
        vi.stubGlobal('document', { startViewTransition: vi.fn() });
        vi.stubGlobal('CSS', undefined);

        expect(supportsClippedViewTransitions()).toBe(false);
    });

    it('checks support for contained view transition groups', () => {
        const supports = vi.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);
        vi.stubGlobal('document', { startViewTransition: vi.fn() });
        vi.stubGlobal('CSS', { supports });

        expect(supportsClippedViewTransitions()).toBe(false);
        expect(supportsClippedViewTransitions()).toBe(true);
        expect(supports).toHaveBeenCalledTimes(2);
        expect(supports).toHaveBeenCalledWith('view-transition-group', 'contain');
    });
});
