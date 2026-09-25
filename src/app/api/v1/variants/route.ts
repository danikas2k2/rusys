import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleGetVariants } from '~/server/api/v1/variants/handleGetVariants';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleGetVariants);
}
