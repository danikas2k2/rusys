import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutUserProfile } from '~/server/api/v1/users/handlePutUserProfile';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ email: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePutUserProfile, await context.params);
}
