import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleSetProductYear } from '~/server/api/v1/products/handleSetProductYear';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; year: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handleSetProductYear, await context.params);
}
