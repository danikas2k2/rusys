import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleAccess } from '~/server/api/v1/access/handleAccess';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleAccess);
}
