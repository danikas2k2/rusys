import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutProductImage } from '~/server/api/v1/products/handlePutProductImage';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePutProductImage, await context.params);
}
