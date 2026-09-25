import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePostAmountHistoryRedo } from '~/server/api/v1/products/handlePostAmountHistoryRedo';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; year: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePostAmountHistoryRedo, await context.params);
}
