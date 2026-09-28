import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleExportLatest } from '~/server/api/v1/exports/handleExportLatest';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleExportLatest);
}
