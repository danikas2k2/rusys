import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleGetGroups } from '~/server/api/v1/groups/handleGetGroups';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleGetGroups);
}
