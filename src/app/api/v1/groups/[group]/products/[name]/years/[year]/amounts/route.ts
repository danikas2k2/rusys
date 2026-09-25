import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutProductAmounts } from '~/server/api/v1/products/handlePutProductAmounts';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; year: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePutProductAmounts, await context.params);
}
