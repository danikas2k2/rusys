import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleGetProductSummaryHistory } from '~/server/api/v1/summary/handleGetProductSummaryHistory';

export const runtime = 'nodejs';

interface RouteContext {
    params: Promise<{ group: string; name: string; year: string }>;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<Response> {
    return runApiHandler(request, handleGetProductSummaryHistory, await context.params);
}
