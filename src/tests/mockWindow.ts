export function mockWindow(): void {
    beforeAll(() => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockReturnValue({
                matches: false,
                media: '',
                onchange: null,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
                addListener: jest.fn(),
                removeListener: jest.fn(),
            }),
        });
    });
}
