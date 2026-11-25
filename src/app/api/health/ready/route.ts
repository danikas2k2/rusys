import { db } from '~/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'no-store' };

export async function GET(): Promise<Response> {
    try {
        await (await db()).collection('groups').findOne({}, { projection: { _id: 1 }, timeoutMS: 2000 });
        return Response.json({ status: 'ready' }, { headers });
    } catch {
        return Response.json({ status: 'unavailable' }, { status: 503, headers });
    }
}
