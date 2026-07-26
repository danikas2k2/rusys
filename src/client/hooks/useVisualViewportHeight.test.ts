import { renderHook } from '@testing-library/react';

import { useVisualViewportHeight } from '~/client/hooks/useVisualViewportHeight';

describe('useVisualViewportHeight', () => {
    const originalVisualViewport = window.visualViewport;

    afterEach(() => {
        Object.defineProperty(window, 'visualViewport', {
            writable: true,
            configurable: true,
            value: originalVisualViewport,
        });
        document.documentElement.style.removeProperty('--visual-viewport-height');
    });

    function mockVisualViewport(height: number) {
        const listeners: Record<string, () => void> = {};
        const viewport = {
            height,
            addEventListener: vi.fn((type: string, listener: () => void) => {
                listeners[type] = listener;
            }),
            removeEventListener: vi.fn(),
        };
        Object.defineProperty(window, 'visualViewport', {
            writable: true,
            configurable: true,
            value: viewport,
        });
        return { viewport, listeners };
    }

    it('does nothing when visualViewport is unsupported', () => {
        Object.defineProperty(window, 'visualViewport', {
            writable: true,
            configurable: true,
            value: undefined,
        });

        renderHook(() => useVisualViewportHeight());

        expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('');
    });

    it('sets the CSS variable to the current visual viewport height', () => {
        mockVisualViewport(600);

        renderHook(() => useVisualViewportHeight());

        expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('600px');
    });

    it('updates the CSS variable when the visual viewport resizes', () => {
        const { viewport, listeners } = mockVisualViewport(600);

        renderHook(() => useVisualViewportHeight());

        viewport.height = 320;
        listeners.resize();

        expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('320px');
    });

    it('removes listeners and the CSS variable on unmount', () => {
        const { viewport } = mockVisualViewport(600);

        const { unmount } = renderHook(() => useVisualViewportHeight());
        unmount();

        expect(viewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(viewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(document.documentElement.style.getPropertyValue('--visual-viewport-height')).toBe('');
    });
});
