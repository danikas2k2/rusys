import { MAX_IMAGE_REQUEST_MB } from '~/common/utils/files';
import { requireSession } from '~/server/auth/session';
import { dropStagedImage, stageImage } from '~/server/data/stagedImages';

export async function POST(request: Request): Promise<Response> {
    // Both upload and pagehide cancellation are same-origin mutations.
    const origin = request.headers.get('origin');
    const host = request.headers.get('host') ?? new URL(request.url).host;
    try {
        if (!origin || !/^https?:\/\//.test(origin) || new URL(origin).host !== host) {
            return new Response(null, { status: 403 });
        }
    } catch {
        return new Response(null, { status: 403 });
    }
    let owner: string;
    try {
        owner = (await requireSession()).email ?? '';
        if (!owner) {
            return new Response(null, { status: 401 });
        }
    } catch {
        return new Response(null, { status: 401 });
    }
    const limit = MAX_IMAGE_REQUEST_MB * 1024 * 1024;
    const reader = request.body?.getReader();
    if (!reader) {
        return new Response(null, { status: 400 });
    }
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            size += value.byteLength;
            if (size > limit) {
                await reader.cancel();
                return new Response(null, { status: 413 });
            }
            chunks.push(value);
        }
        const body: unknown = JSON.parse(Buffer.concat(chunks).toString());
        if (!body || typeof body !== 'object') {
            return new Response(null, { status: 400 });
        }
        if ('drop' in body && typeof body.drop === 'string') {
            await dropStagedImage(body.drop, owner);
            return new Response(null, { status: 204 });
        }
        if (!('image' in body)) {
            return new Response(null, { status: 400 });
        }
        return Response.json(
            { token: await stageImage(body.image, owner) },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch {
        return new Response(null, { status: 400 });
    }
}
