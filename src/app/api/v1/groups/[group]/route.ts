import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePatchGroup } from '~/server/api/v1/groups/handlePatchGroup';
import { handlePutGroup } from '~/server/api/v1/groups/handlePutGroup';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePutGroup, await context.params);
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePatchGroup, await context.params);
}
