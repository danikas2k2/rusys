import type { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';
import { handleCreateProduct } from '~/server/api/v1/products/handleCreateProduct';
import { handleGetProducts } from '~/server/api/v1/products/handleGetProducts';

export const runtime = 'nodejs';

export function GET(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleGetProducts);
}

export function POST(request: NextRequest): Promise<Response> {
    return runApiHandler(request, handleCreateProduct);
}
