import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleProductReviewStatuses } from '~/server/api/v1/products/handleProductReviewStatuses';

export const runtime = 'nodejs';

export function PATCH(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleProductReviewStatuses);
}
