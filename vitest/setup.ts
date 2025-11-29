import '@testing-library/jest-dom/vitest';

import { afterEach, beforeEach, vi } from 'vitest';

import './expect';

// Make jest available as alias for vi (for compatibility with existing tests)
/*if (typeof (globalThis as typeof globalThis & { jest?: unknown }).jest === 'undefined') {
    (globalThis as typeof globalThis & { jest: unknown }).jest = {
        ...vi,
        fn: vi.fn,
        mock: vi.mock,
        spyOn: vi.spyOn,
        clearAllMocks: vi.clearAllMocks,
        resetAllMocks: vi.resetAllMocks,
        restoreAllMocks: vi.restoreAllMocks,
        mocked: vi.mocked,
    } as typeof vi & {
        fn: typeof vi.fn;
        mock: typeof vi.mock;
        spyOn: typeof vi.spyOn;
        clearAllMocks: typeof vi.clearAllMocks;
        resetAllMocks: typeof vi.resetAllMocks;
        restoreAllMocks: typeof vi.restoreAllMocks;
        mocked: typeof vi.mocked;
    };
}*/

// update JSDOM setup
if (globalThis.HTMLElement) {
    const { getComputedStyle } = globalThis;
    globalThis.getComputedStyle = (elt: any) => getComputedStyle(elt);

    globalThis.HTMLElement.prototype.scrollIntoView = () => {};

    Object.defineProperty(globalThis, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    // Polyfill TextEncoder/TextDecoder if they're not already available
    // jsdom doesn't provide these, so we need to polyfill them from node:util
    // Use require() instead of import to avoid Vite bundling issues
    if (!globalThis.TextEncoder || !globalThis.TextDecoder) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { TextDecoder: NodeTextDecoder, TextEncoder: NodeTextEncoder } = require('node:util');
            Object.assign(globalThis as typeof globalThis & Record<string, unknown>, {
                TextEncoder: NodeTextEncoder as unknown as typeof globalThis.TextEncoder,
                TextDecoder: NodeTextDecoder as unknown as typeof globalThis.TextDecoder,
            });
        } catch {
            // If node:util is not available, TextEncoder/TextDecoder should be available natively
            // or we'll rely on the environment to provide them
        }
    }

    Object.assign(globalThis as typeof globalThis & Record<string, unknown>, {
        ResizeObserver: class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    });
}

beforeEach(() => {
    // Mock console.error but allow React warnings/errors in tests
    const originalError = console.error;
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
        // Allow React warnings and known non-critical errors
        /*const message = args.join(' ');
        if (
            message.includes('Warning:') ||
            message.includes('ReactDOM.render') ||
            message.includes('act(') ||
            message.includes('Not implemented:')
        ) {
            // Silently ignore React warnings and known issues
            return;
        }*/
        // For other errors, log them but don't throw
        originalError(...args);
    });
});

afterEach(() => vi.restoreAllMocks());
