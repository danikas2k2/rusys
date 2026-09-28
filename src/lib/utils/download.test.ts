import type { MockInstance } from 'vitest';

import { download } from '~/lib/utils/download';

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
        revokeObjectURLSpy.mockImplementation(() => undefined);

        createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor);
        removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor);
        clickSpy = vi.spyOn(mockAnchor, 'click').mockImplementation(() => undefined);
    });

    afterEach(() => vi.clearAllMocks());

    const blob = new Blob(['zip-bytes'], { type: 'application/zip' });

    it('creates anchor element', () => {
        download(blob);

        expect(createElementSpy).toHaveBeenCalledWith('a');
    });

    it('passes the blob straight to createObjectURL', () => {
        download(blob);

        expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
        expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    });

    it('sets anchor href to blob URL', () => {
        download(blob);

        expect(mockAnchor.href).toBe('blob:mock-url');
    });

    it('sets anchor download with default filename', () => {
        const mockDate = new Date('2024-01-15T10:30:00.000Z');
        const dateSpy = vi.spyOn(globalThis, 'Date').mockImplementation(function () {
            return mockDate;
        } as unknown as typeof Date);

        download(blob);

        dateSpy.mockRestore();

        expect(mockAnchor.download).toBe('2024-01-15.zip');
    });

    it('sets anchor download with custom filename', () => {
        download(blob, 'custom-export.zip');

        expect(mockAnchor.download).toBe('custom-export.zip');
    });

    it('appends anchor to document body', () => {
        download(blob);

        expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    });

    it('clicks anchor element', () => {
        download(blob);

        expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('removes anchor from document body', () => {
        download(blob);

        expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
    });

    it('revokes object URL', () => {
        download(blob);

        expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
    });

    it('performs operations in correct order', () => {
        download(blob);

        expect(createElementSpy.mock.invocationCallOrder[0]).toBeLessThan(
            createObjectURLSpy.mock.invocationCallOrder[0]
        );
        expect(createObjectURLSpy.mock.invocationCallOrder[0]).toBeLessThan(appendChildSpy.mock.invocationCallOrder[0]);
        expect(appendChildSpy.mock.invocationCallOrder[0]).toBeLessThan(clickSpy.mock.invocationCallOrder[0]);
        expect(clickSpy.mock.invocationCallOrder[0]).toBeLessThan(removeChildSpy.mock.invocationCallOrder[0]);
        expect(removeChildSpy.mock.invocationCallOrder[0]).toBeLessThan(revokeObjectURLSpy.mock.invocationCallOrder[0]);
    });
});
