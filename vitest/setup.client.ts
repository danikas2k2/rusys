import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'node:util';

import { configure } from '@testing-library/dom';
import { afterEach, beforeEach, vi } from 'vitest';

// Ensure test runs don't accidentally behave like production if CI sets NODE_ENV=production.
if (process.env.NODE_ENV === 'production') {
    process.env.NODE_ENV = 'test';
}

// waitFor's default 1000ms timeout is tight enough that gesture/timer-driven assertions
// (e.g. SwipeableRow's requestAnimationFrame-based updates) can spuriously time out when the
// whole suite is running under heavy CPU contention (many worker threads + jsdom + Mongo at
// once), even though the assertion itself is correct and would pass given a bit more wall-clock
// time. A generous ceiling only matters on the slow/failing path — passing assertions resolve as
// soon as they're true, so this doesn't slow down normal runs. Kept below vitest's 5000ms default
// testTimeout so a genuinely failing assertion still surfaces as a normal failure, not a test
// timeout with a less useful error.
configure({ asyncUtilTimeout: 3000 });

// ---------------------------------------------------------------------------
// localStorage mock — define unconditionally to avoid Node.js ExperimentalWarning
// (accessing globalThis.localStorage in Node 22+ triggers the warning before
// returning undefined, so we cannot check first)
// ---------------------------------------------------------------------------
{
    const _data = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
        value: {
            getItem: (key: string) => _data.get(key) ?? null,
            setItem: (key: string, value: string) => _data.set(key, value),
            removeItem: (key: string) => _data.delete(key),
            clear: () => _data.clear(),
            key: (index: number) => Array.from(_data.keys())[index] ?? null,
            get length() {
                return _data.size;
            },
        } satisfies Storage,
        writable: true,
        configurable: true,
    });
}

// ---------------------------------------------------------------------------
// JSDOM patches — only applied when running in jsdom environment
// ---------------------------------------------------------------------------
if (globalThis.HTMLElement) {
    const { getComputedStyle } = globalThis;
    globalThis.getComputedStyle = (elt: Element) => getComputedStyle(elt);

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

    Object.assign(globalThis, {
        TextEncoder: NodeTextEncoder as unknown as typeof globalThis.TextEncoder,
        TextDecoder: NodeTextDecoder as unknown as typeof globalThis.TextDecoder,
        ResizeObserver: class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    });
}

// ---------------------------------------------------------------------------
// Per-test hooks
// ---------------------------------------------------------------------------

let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
        const message = args.join(' ');
        // Ignore React's "not wrapped in act" warnings — these fire asynchronously
        // after test cleanup and cannot always be suppressed with act().
        if (message.includes('not wrapped in act')) {
            return;
        }
        throw new Error(`console.error was called ${message}`);
    });
});

afterEach(() => {
    consoleErrorSpy?.mockRestore();
});
