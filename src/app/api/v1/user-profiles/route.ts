import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleGetUserProfiles } from '~/server/api/v1/users/handleGetUserProfiles';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleGetUserProfiles);
}
