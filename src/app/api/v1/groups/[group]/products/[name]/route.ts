import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleDeleteProduct } from '~/server/api/v1/products/handleDeleteProduct';
import { handlePatchProduct } from '~/server/api/v1/products/handlePatchProduct';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePatchProduct, await context.params);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handleDeleteProduct, await context.params);
}
