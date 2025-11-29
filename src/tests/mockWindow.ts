export function mockWindow(): void {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockReturnValue({
                matches: false,
                media: '',
                onchange: null,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
            }),
        });
    });
}
