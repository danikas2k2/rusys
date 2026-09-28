import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleImport } from '~/server/api/v1/imports/handleImport';

export const runtime = 'nodejs';

export function POST(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleImport);
}
