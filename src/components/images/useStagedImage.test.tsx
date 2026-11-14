import { act, cleanup, renderHook } from '@testing-library/react';

import { useStagedImage } from '~/components/images/useStagedImage';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';
import { SchemaError } from '~/schema';
import { dropImageAction } from '~/server/actions/images';

vi.mock(import('~/lib/utils/uploadWithProgress'));
vi.mock(import('~/server/actions/images'));
const token = `upload:${'a'.repeat(64)}`;

describe('staged image editor', () => {
    beforeEach(() => {
        vi.mocked(dropImageAction).mockResolvedValue(undefined);
        vi.mocked(uploadWithProgress).mockImplementation(async (_method, _url, _body, progress, response) => {
            progress?.(100);
            response?.(JSON.stringify({ token }));
        });
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
        vi.unstubAllGlobals();
    });

    it.each(['{}', '{"token":"invalid"}', 'null'])('rejects an unusable token response (%s)', async (body) => {
        vi.mocked(uploadWithProgress).mockImplementationOnce(async (_method, _url, _body, _progress, response) => {
            response?.(body);
        });
        const onChange = vi.fn();
        const { result } = renderHook(() => useStagedImage(true, onChange));
        await act(async () => {
            await expect(result.current.drop('image')).rejects.toThrow(SchemaError.UploadFailed);
        });

        expect(onChange).not.toHaveBeenCalled();
        expect(result.current.progress).toBeUndefined();
    });

    it('rejects an upload response that never supplied a token', async () => {
        vi.mocked(uploadWithProgress).mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useStagedImage(true, vi.fn()));
        await act(async () => {
            await expect(result.current.drop('image')).rejects.toThrow(SchemaError.UploadFailed);
        });
    });

    it('releases the previous token after a successful replacement even if dropping it fails', async () => {
        const { result } = renderHook(() => useStagedImage(true, vi.fn()));
        await act(async () => {
            await result.current.drop('first');
        });
        vi.mocked(dropImageAction).mockRejectedValueOnce(new Error('offline'));
        const replacement = `upload:${'b'.repeat(64)}`;
        vi.mocked(uploadWithProgress).mockImplementationOnce(async (_method, _url, _body, _progress, response) => {
            response?.(JSON.stringify({ token: replacement }));
        });
        await act(async () => {
            await expect(result.current.drop('second')).resolves.toBe(replacement);
        });

        expect(dropImageAction).toHaveBeenCalledWith(token);
        expect(result.current.preview).toBe('second');
    });

    it('tolerates a failed cancellation signal so server expiry can handle cleanup', async () => {
        const { result, unmount } = renderHook(() => useStagedImage(true, vi.fn()));
        await act(async () => {
            await result.current.drop('image');
        });
        vi.mocked(dropImageAction).mockRejectedValueOnce(new Error('offline'));
        unmount();
        await act(async () => undefined);

        expect(dropImageAction).toHaveBeenCalledWith(token);
    });

    it('uploads separately, gives the form only a token, and drops it on close', async () => {
        const onChange = vi.fn();
        const { result, rerender } = renderHook(({ opened }) => useStagedImage(opened, onChange), {
            initialProps: { opened: true },
        });
        await act(async () => {
            await result.current.drop('data:image/png;base64,AAAA');
        });

        expect(uploadWithProgress).toHaveBeenCalledWith(
            'POST',
            '/api/images',
            JSON.stringify({ image: 'data:image/png;base64,AAAA' }),
            expect.any(Function),
            expect.any(Function)
        );
        expect(onChange).toHaveBeenCalledWith(token);

        rerender({ opened: false });

        expect(dropImageAction).toHaveBeenCalledWith(token);
    });

    it('drops an upload that completes after the editor unmounts', async () => {
        let complete: () => void = () => undefined;
        vi.mocked(uploadWithProgress).mockImplementationOnce(
            (_method, _url, _body, progress, response) =>
                new Promise<void>((resolve) => {
                    complete = () => {
                        progress?.(100);
                        response?.(JSON.stringify({ token }));
                        resolve();
                    };
                })
        );
        const onChange = vi.fn();
        const { result, unmount } = renderHook(() => useStagedImage(true, onChange));
        let uploading: Promise<string | undefined>;
        act(() => {
            uploading = result.current.drop('data:image/png;base64,AAAA');
        });
        unmount();
        await act(async () => {
            complete();
            await uploading;
        });

        expect(onChange).not.toHaveBeenCalled();
        expect(dropImageAction).toHaveBeenCalledWith(token);
    });

    it('ignores file reads that finish after the editor closes', async () => {
        const { result, unmount } = renderHook(() => useStagedImage(true, vi.fn()));
        const drop = result.current.drop;
        unmount();
        await drop('late file read');

        expect(uploadWithProgress).not.toHaveBeenCalled();
    });

    it('keeps the previous upload when replacement fails', async () => {
        const onChange = vi.fn();
        const { result } = renderHook(() => useStagedImage(true, onChange));
        await act(async () => {
            await result.current.drop('first');
        });
        vi.mocked(uploadWithProgress).mockRejectedValueOnce(new Error('failed'));
        await act(async () => {
            await expect(result.current.drop('second')).rejects.toThrow('failed');
        });

        expect(result.current.preview).toBe('first');
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(dropImageAction).not.toHaveBeenCalled();

        act(() => result.current.remove());

        expect(onChange).toHaveBeenLastCalledWith('');
        expect(dropImageAction).toHaveBeenCalledWith(token);
    });

    it('sends a cancellation beacon when the page closes', async () => {
        const sendBeacon = vi.fn().mockReturnValue(true);
        vi.stubGlobal('navigator', { sendBeacon });
        const { result } = renderHook(() => useStagedImage(true, vi.fn()));
        await act(async () => {
            await result.current.drop('image');
        });
        act(() => {
            window.dispatchEvent(new Event('pagehide'));
        });

        expect(sendBeacon).toHaveBeenCalledExactlyOnceWith('/api/images', expect.any(Blob));
        expect(dropImageAction).toHaveBeenCalledWith(token);
    });
});
