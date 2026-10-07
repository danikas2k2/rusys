import { getSessionProfile } from '~/server/auth/session';

export async function GET(): Promise<Response> {
    const profile = await getSessionProfile();
    return Response.json(profile?.sub ? { sub: profile.sub } : {}, {
        status: profile?.sub ? 200 : 401,
        headers: { 'Cache-Control': 'no-store' },
    });
}
