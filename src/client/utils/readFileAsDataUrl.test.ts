import { readFileAsDataUrl } from '~/client/utils/readFileAsDataUrl';

describe('readFileAsDataUrl', () => {
    it('resolves with a data URL for the given file', async () => {
        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

        await expect(readFileAsDataUrl(file)).resolves.toMatch(/^data:text\/plain;base64,/);
    });

    it('rejects when reading fails', async () => {
        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
        const error = new DOMException('Read failed');
        const readAsDataURL = vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (
            this: FileReader
        ) {
            Object.defineProperty(this, 'error', { value: error, configurable: true });
            this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>);
        });

        await expect(readFileAsDataUrl(file)).rejects.toBe(error);

        readAsDataURL.mockRestore();
    });
});
