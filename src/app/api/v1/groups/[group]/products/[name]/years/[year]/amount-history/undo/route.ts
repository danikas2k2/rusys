import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePostAmountHistoryUndo } from '~/server/api/v1/products/handlePostAmountHistoryUndo';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; year: string }>;
}

export async function POST(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handlePostAmountHistoryUndo, await context.params);
}
