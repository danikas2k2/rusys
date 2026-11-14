/** @vitest-environment node */
import { MAX_IMAGE_REQUEST_MB } from '~/common/utils/files';
import { requireSession } from '~/server/auth/session';
import { dropStagedImage, stageImage } from '~/server/data/stagedImages';
import { POST } from './route';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/data/stagedImages'));

describe('staged upload endpoint', () => {
    beforeEach(() => {
        vi.mocked(requireSession).mockResolvedValue({ email: 'owner' } as Awaited<ReturnType<typeof requireSession>>);
    });

    afterEach(() => vi.resetAllMocks());

    it.each(['https://[', 'null', ''])('rejects invalid origins (%s)', async (origin) => {
        expect((await POST(request({}, origin))).status).toBe(403);
        expect(requireSession).not.toHaveBeenCalled();
    });

    it('uses the URL host when no Host header was supplied', async () => {
        const input = new Request('https://public.example/api/images', {
            method: 'POST',
            headers: { origin: 'https://public.example' },
            body: '{}',
        });

        expect((await POST(input)).status).toBe(400);
    });

    it.each([undefined, ''])('rejects sessions without an owner (%s)', async (email) => {
        vi.mocked(requireSession).mockResolvedValue({ email } as Awaited<ReturnType<typeof requireSession>>);

        expect((await POST(request({ image: 'data' }))).status).toBe(401);
        expect(stageImage).not.toHaveBeenCalled();
    });

    it('rejects a missing body', async () => {
        const input = new Request('https://public.example/api/images', {
            method: 'POST',
            headers: { origin: 'https://public.example' },
        });

        expect((await POST(input)).status).toBe(400);
    });

    it.each([null, 42, {}, { drop: 42 }])('rejects an invalid body (%j)', async (body) => {
        expect((await POST(request(body))).status).toBe(400);
        expect(stageImage).not.toHaveBeenCalled();
        expect(dropStagedImage).not.toHaveBeenCalled();
    });

    it('rejects oversized streamed bodies before processing an image', async () => {
        const input = request({});
        vi.spyOn(input, 'body', 'get').mockReturnValue(
            new ReadableStream({
                start(controller) {
                    controller.enqueue(new Uint8Array(MAX_IMAGE_REQUEST_MB * 1024 * 1024 + 1));
                },
            })
        );

        expect((await POST(input)).status).toBe(413);
        expect(stageImage).not.toHaveBeenCalled();
    });

    it('does not expose storage failures in responses', async () => {
        vi.mocked(stageImage).mockRejectedValueOnce(new Error('private storage path'));
        const response = await POST(request({ image: 'data' }));

        expect(response.status).toBe(400);
        await expect(response.text()).resolves.toBe('');
    });

    function request(body: unknown, origin = 'https://public.example') {
        return new Request('http://backend:3000/api/images', {
            method: 'POST',
            headers: { origin, host: 'public.example', 'content-type': 'application/json' },
            body: JSON.stringify(body),
        });
    }

    it('accepts same-origin uploads behind a reverse proxy and returns only a token', async () => {
        vi.mocked(stageImage).mockResolvedValue('upload:token');
        const response = await POST(request({ image: 'data:image/png;base64,AAAA' }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toStrictEqual({ token: 'upload:token' });
        expect(stageImage).toHaveBeenCalledWith('data:image/png;base64,AAAA', 'owner');
    });

    it('rejects cross-origin requests before reading uploads', async () => {
        expect((await POST(request({ image: 'data' }, 'https://other.example'))).status).toBe(403);
        expect(stageImage).not.toHaveBeenCalled();
        expect(requireSession).not.toHaveBeenCalled();
    });

    it('requires authentication', async () => {
        vi.mocked(requireSession).mockRejectedValue(new Error('Unauthorized'));

        expect((await POST(request({ image: 'data' }))).status).toBe(401);
        expect(stageImage).not.toHaveBeenCalled();
    });

    it('accepts cancellation beacons and binds deletion to the authenticated owner', async () => {
        expect((await POST(request({ drop: 'upload:token' }))).status).toBe(204);
        expect(dropStagedImage).toHaveBeenCalledWith('upload:token', 'owner');
    });
});
