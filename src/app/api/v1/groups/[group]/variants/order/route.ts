import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutVariantsOrder } from '~/server/api/v1/variants/handlePutVariantsOrder';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePutVariantsOrder, await context.params);
}
