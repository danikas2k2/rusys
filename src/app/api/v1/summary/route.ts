import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleGetSummary } from '~/server/api/v1/summary/handleGetSummary';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleGetSummary);
}
