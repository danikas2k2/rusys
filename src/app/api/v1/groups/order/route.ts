import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handlePutGroupsOrder } from '~/server/api/v1/groups/handlePutGroupsOrder';

export const runtime = 'nodejs';

export function PUT(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handlePutGroupsOrder);
}
