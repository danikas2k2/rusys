import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleAuthClientId } from '~/server/api/v1/auth/handleAuthClientId';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleAuthClientId);
}
