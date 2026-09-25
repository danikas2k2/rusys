import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutProductVariantImage } from '~/server/api/v1/products/handlePutProductVariantImage';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; variant: string }>;
}

export async function PUT(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePutProductVariantImage, await context.params);
}
