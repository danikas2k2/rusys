'use server';

import { runServerHandler, type ApiHandler, type ApiRequest } from '~/server/api/next';
import { handleDeleteGroup } from '~/server/api/v1/groups/handleDeleteGroup';
import { handlePatchGroup } from '~/server/api/v1/groups/handlePatchGroup';
import { handlePutGroup } from '~/server/api/v1/groups/handlePutGroup';
import { handlePutGroupsOrder } from '~/server/api/v1/groups/handlePutGroupsOrder';
import { handleCreateProduct } from '~/server/api/v1/products/handleCreateProduct';
import { handleDeleteProduct } from '~/server/api/v1/products/handleDeleteProduct';
import { handlePatchProduct } from '~/server/api/v1/products/handlePatchProduct';
import { handlePostAmountHistory } from '~/server/api/v1/products/handlePostAmountHistory';
import { handlePostAmountHistoryRedo } from '~/server/api/v1/products/handlePostAmountHistoryRedo';
import { handlePostAmountHistoryUndo } from '~/server/api/v1/products/handlePostAmountHistoryUndo';
import { handlePostProductAmountTransfer } from '~/server/api/v1/products/handlePostProductAmountTransfer';
import { handleProductReviewStatuses } from '~/server/api/v1/products/handleProductReviewStatuses';
import { handlePutProductAmounts } from '~/server/api/v1/products/handlePutProductAmounts';
import { handlePutProductImage } from '~/server/api/v1/products/handlePutProductImage';
import { handlePutProductVariantImage } from '~/server/api/v1/products/handlePutProductVariantImage';
import { handleSetProductYear } from '~/server/api/v1/products/handleSetProductYear';
import { handleDeleteVariant } from '~/server/api/v1/variants/handleDeleteVariant';
import { handlePatchVariant } from '~/server/api/v1/variants/handlePatchVariant';
import { handlePostVariantCopy } from '~/server/api/v1/variants/handlePostVariantCopy';
import { handlePutVariantsOrder } from '~/server/api/v1/variants/handlePutVariantsOrder';
import { requireSession } from '~/server/auth/session';

type Method = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Operation {
    method: Method;
    path: string;
    handler: ApiHandler;
}

// These operations retain the existing validation and error handling while
// client mutations call them in-process through a Server Action.
const operations: readonly Operation[] = [
    { method: 'POST', path: 'products', handler: handleCreateProduct },
    { method: 'PATCH', path: 'products/review-statuses', handler: handleProductReviewStatuses },
    { method: 'PUT', path: 'groups/order', handler: handlePutGroupsOrder },
    { method: 'PUT', path: 'groups/:group', handler: handlePutGroup },
    { method: 'PATCH', path: 'groups/:group', handler: handlePatchGroup },
    { method: 'DELETE', path: 'groups/:group', handler: handleDeleteGroup },
    { method: 'PUT', path: 'groups/:group/variants/order', handler: handlePutVariantsOrder },
    { method: 'PATCH', path: 'groups/:group/variants/:variant', handler: handlePatchVariant },
    { method: 'DELETE', path: 'groups/:group/variants/:variant', handler: handleDeleteVariant },
    { method: 'POST', path: 'groups/:group/variants/:variant/copies', handler: handlePostVariantCopy },
    { method: 'PATCH', path: 'groups/:group/products/:name', handler: handlePatchProduct },
    { method: 'DELETE', path: 'groups/:group/products/:name', handler: handleDeleteProduct },
    { method: 'PUT', path: 'groups/:group/products/:name/image', handler: handlePutProductImage },
    {
        method: 'PUT',
        path: 'groups/:group/products/:name/variants/:variant/image',
        handler: handlePutProductVariantImage,
    },
    { method: 'PATCH', path: 'groups/:group/products/:name/years/:year', handler: handleSetProductYear },
    { method: 'PUT', path: 'groups/:group/products/:name/years/:year/amounts', handler: handlePutProductAmounts },
    {
        method: 'POST',
        path: 'groups/:group/products/:name/years/:year/amounts/transfers',
        handler: handlePostProductAmountTransfer,
    },
    {
        method: 'POST',
        path: 'groups/:group/products/:name/years/:year/amount-history',
        handler: handlePostAmountHistory,
    },
    {
        method: 'POST',
        path: 'groups/:group/products/:name/years/:year/amount-history/undo',
        handler: handlePostAmountHistoryUndo,
    },
    {
        method: 'POST',
        path: 'groups/:group/products/:name/years/:year/amount-history/redo',
        handler: handlePostAmountHistoryRedo,
    },
];

function findOperation(method: string, path: string): { handler: ApiHandler; params: ApiRequest['params'] } {
    const segments = path.split('/');
    for (const operation of operations) {
        if (operation.method !== method) {
            continue;
        }
        const pattern = operation.path.split('/');
        if (pattern.length !== segments.length) {
            continue;
        }
        const params: ApiRequest['params'] = {};
        let matches = true;
        for (let index = 0; index < pattern.length; index++) {
            if (pattern[index].startsWith(':')) {
                params[pattern[index].slice(1)] = decodeURIComponent(segments[index]);
            } else if (pattern[index] !== segments[index]) {
                matches = false;
                break;
            }
        }
        if (matches) {
            return { handler: operation.handler, params };
        }
    }
    throw new Error('Unsupported operation');
}

export async function requestData(url: string, method: string, data?: unknown): Promise<void> {
    await requireSession();
    if (typeof url !== 'string' || !url.startsWith('/api/v1/')) {
        throw new Error('Unsupported operation');
    }
    const parsed = new URL(url, 'http://localhost');
    const { handler, params } = findOperation(method, parsed.pathname.slice('/api/v1/'.length));
    const response = await runServerHandler(handler, { body: data ?? {}, params, query: {} });
    if (!response.ok) {
        const failure = (await response.json()) as { error?: { message?: string } };
        throw new Error(failure.error?.message ?? `Request failed (${response.status})`);
    }
}
