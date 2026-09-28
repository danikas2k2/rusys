import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleDeleteVariant } from '~/server/api/v1/variants/handleDeleteVariant';
import { handlePatchVariant } from '~/server/api/v1/variants/handlePatchVariant';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; variant: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePatchVariant, await context.params);
}

export async function DELETE(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handleDeleteVariant, await context.params);
}
