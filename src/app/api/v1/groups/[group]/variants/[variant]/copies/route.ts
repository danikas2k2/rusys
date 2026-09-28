import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePostVariantCopy } from '~/server/api/v1/variants/handlePostVariantCopy';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; variant: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePostVariantCopy, await context.params);
}
