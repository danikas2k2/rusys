import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';

describe('uploadWithProgress', () => {
    class MockRequest {
        static current: MockRequest;
        upload = { onprogress: (_event: ProgressEvent) => {} };
        onerror = () => {};
        onabort = () => {};
        onload = () => {};
        status = 0;
        responseText = '';
        open = vi.fn();
        setRequestHeader = vi.fn();
        send = vi.fn();

        constructor() {
            MockRequest.current = this;
        }
    }

    beforeEach(() => vi.stubGlobal('XMLHttpRequest', MockRequest));

    afterEach(() => vi.unstubAllGlobals());

    it('reports bytes sent and waits for a successful response', async () => {
        const onProgress = vi.fn();
        const body = new FormData();
        const result = uploadWithProgress('POST', '/api/v1/imports', body, onProgress);
        const request = MockRequest.current;
        request.upload.onprogress(new ProgressEvent('progress', { lengthComputable: true, loaded: 25, total: 100 }));
        request.upload.onprogress(new ProgressEvent('progress', { lengthComputable: false, loaded: 50, total: 100 }));

        expect(request.open).toHaveBeenCalledWith('POST', '/api/v1/imports');
        expect(request.send).toHaveBeenCalledWith(body);
        expect(onProgress).toHaveBeenCalledTimes(1);
        expect(onProgress).toHaveBeenCalledWith(25);

        request.status = 204;
        request.onload();

        await expect(result).resolves.toBeUndefined();
    });

    it('returns the API error message on failure', async () => {
        const result = uploadWithProgress('PUT', '/image', '{"image":"data:"}');
        const request = MockRequest.current;

        expect(request.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');

        request.status = 400;
        request.responseText = '{"error":{"message":"Invalid image"}}';
        request.onload();

        await expect(result).rejects.toThrow('Invalid image');
    });
});
