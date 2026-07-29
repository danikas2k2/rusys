import type { MockInstance } from 'vitest';

import { download } from '~/client/utils/download';

describe('download', () => {
    let mockAnchor: HTMLAnchorElement;

    const createObjectURLSpy = vi.fn();
    const revokeObjectURLSpy = vi.fn();

    let createElementSpy: MockInstance;
    let appendChildSpy: MockInstance;
    let removeChildSpy: MockInstance;
    let clickSpy: MockInstance;

    beforeAll(() => {
        globalThis.URL.createObjectURL = createObjectURLSpy;
        globalThis.URL.revokeObjectURL = revokeObjectURLSpy;
    });

    beforeEach(() => {
        mockAnchor = document.createElement('a');

        createObjectURLSpy.mockReturnValue('blob:mock-url');
        revokeObjectURLSpy.mockImplementation();

        createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
        removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
        clickSpy = vi.spyOn(mockAnchor, 'click').mockImplementation();
    });

    afterEach(() => vi.clearAllMocks());

    it('creates anchor element', () => {
        download({ test: 'data' });

        expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('creates blob with JSON data', () => {
        const data = { test: 'data', number: 123 };

        download(data);

        const blob = (createObjectURLSpy.mock.calls[0] as unknown[])[0] as Blob;

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(blob).toBeInstanceOf(Blob);
        expect(blob).toHaveProperty('type', '');
    });

    it('sets anchor href to blob URL', () => {
        download({ test: 'data' });

        expect(mockAnchor.href).toBe('blob:mock-url');
    });

    it('sets anchor download with default filename', () => {
        const mockDate = new Date('2024-01-15T10:30:00.000Z');
        class MockDate {
            constructor() {
                return mockDate;
            }
        }
        const dateSpy = vi.spyOn(globalThis, 'Date').mockImplementation(MockDate as unknown as typeof Date);

        download({ test: 'data' });

        dateSpy.mockRestore();

        expect(mockAnchor.download).toBe('data-2024-01-15.json');
    });

    it('sets anchor download with custom filename', () => {
        download({ test: 'data' }, 'custom-export.json');

        expect(mockAnchor.download).toBe('custom-export.json');
    });

    it('appends anchor to document body', () => {
        download({ test: 'data' });

        expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    });

    it('clicks anchor element', () => {
        download({ test: 'data' });

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('removes anchor from document body', () => {
        download({ test: 'data' });

        expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
    });

    it('revokes object URL', () => {
        download({ test: 'data' });

        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('performs operations in correct order', () => {
        download({ test: 'data' });

        expect(createElementSpy.mock.invocationCallOrder[0]).toBeLessThan(
            createObjectURLSpy.mock.invocationCallOrder[0]
        );
        expect(createObjectURLSpy.mock.invocationCallOrder[0]).toBeLessThan(appendChildSpy.mock.invocationCallOrder[0]);
        expect(appendChildSpy.mock.invocationCallOrder[0]).toBeLessThan(clickSpy.mock.invocationCallOrder[0]);
        expect(clickSpy.mock.invocationCallOrder[0]).toBeLessThan(removeChildSpy.mock.invocationCallOrder[0]);
        expect(removeChildSpy.mock.invocationCallOrder[0]).toBeLessThan(revokeObjectURLSpy.mock.invocationCallOrder[0]);
    });

    it('serializes data to JSON and passes to Blob', () => {
        const data = { test: 'value', number: 123, nested: { key: 'val' } };

        download(data);

        const blob = (createObjectURLSpy.mock.calls[0] as unknown[])[0] as Blob;

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(blob).toBeInstanceOf(Blob);
    });
});
