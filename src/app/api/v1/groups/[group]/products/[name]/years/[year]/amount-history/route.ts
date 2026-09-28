import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePostAmountHistory } from '~/server/api/v1/products/handlePostAmountHistory';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; year: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePostAmountHistory, await context.params);
}
