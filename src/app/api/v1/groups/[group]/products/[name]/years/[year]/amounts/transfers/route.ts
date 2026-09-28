import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePostProductAmountTransfer } from '~/server/api/v1/products/handlePostProductAmountTransfer';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; year: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePostProductAmountTransfer, await context.params);
}
