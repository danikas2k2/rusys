import { NextRequest } from 'next/server';

import * as access from '~/app/api/v1/access/route';
import * as clientId from '~/app/api/v1/auth/client-id/route';
import * as exportsLatest from '~/app/api/v1/exports/latest/route';
import * as productImage from '~/app/api/v1/groups/[group]/products/[name]/image/route';
import * as product from '~/app/api/v1/groups/[group]/products/[name]/route';
import * as variantImage from '~/app/api/v1/groups/[group]/products/[name]/variants/[variant]/image/route';
import * as productRedo from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/amount-history/redo/route';
import * as productAmountHistory from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/amount-history/route';
import * as productUndo from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/amount-history/undo/route';
import * as productAmounts from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/amounts/route';
import * as productTransfers from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/amounts/transfers/route';
import * as productHistory from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/history/route';
import * as productYear from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/route';
import * as productSummaryHistory from '~/app/api/v1/groups/[group]/products/[name]/years/[year]/summary-history/route';
import * as group from '~/app/api/v1/groups/[group]/route';
import * as variantCopy from '~/app/api/v1/groups/[group]/variants/[variant]/copies/route';
import * as variant from '~/app/api/v1/groups/[group]/variants/[variant]/route';
import * as variantOrder from '~/app/api/v1/groups/[group]/variants/order/route';
import * as groupOrder from '~/app/api/v1/groups/order/route';
import * as groups from '~/app/api/v1/groups/route';
import * as imports from '~/app/api/v1/imports/route';
import * as productReview from '~/app/api/v1/products/review-statuses/route';
import * as products from '~/app/api/v1/products/route';
import * as summary from '~/app/api/v1/summary/route';
import * as userProfile from '~/app/api/v1/user-profiles/[email]/route';
import * as userProfiles from '~/app/api/v1/user-profiles/route';
import * as variants from '~/app/api/v1/variants/route';
import { runApiHandler } from '~/server/api/next';

vi.mock(import('~/server/api/next'), () => ({ runApiHandler: vi.fn() }));

const groupParams = { group: 'Uogienės' };
const productParams = { ...groupParams, name: 'Avietės' };
const yearParams = { ...productParams, year: '26' };
const variantParams = { ...groupParams, variant: 'Stiklainis' };

const routes: readonly {
    name: string;
    module: Record<string, unknown>;
    method: string;
    params?: Record<string, string>;
}[] = [
    { name: 'access', module: access, method: 'GET' },
    { name: 'client ID', module: clientId, method: 'GET' },
    { name: 'latest export', module: exportsLatest, method: 'GET' },
    { name: 'groups', module: groups, method: 'GET' },
    { name: 'group update', module: group, method: 'PUT', params: groupParams },
    { name: 'group rename', module: group, method: 'PATCH', params: groupParams },
    { name: 'group removal', module: group, method: 'DELETE', params: groupParams },
    { name: 'group order', module: groupOrder, method: 'PUT' },
    { name: 'product list', module: products, method: 'GET' },
    { name: 'product creation', module: products, method: 'POST' },
    { name: 'product update', module: product, method: 'PATCH', params: productParams },
    { name: 'product removal', module: product, method: 'DELETE', params: productParams },
    { name: 'product image', module: productImage, method: 'PUT', params: productParams },
    { name: 'variant image', module: variantImage, method: 'PUT', params: { ...productParams, variant: 'Stiklainis' } },
    { name: 'product year', module: productYear, method: 'PATCH', params: yearParams },
    { name: 'product amounts', module: productAmounts, method: 'PUT', params: yearParams },
    { name: 'amount transfers', module: productTransfers, method: 'POST', params: yearParams },
    { name: 'amount history', module: productAmountHistory, method: 'POST', params: yearParams },
    { name: 'undo history', module: productUndo, method: 'POST', params: yearParams },
    { name: 'redo history', module: productRedo, method: 'POST', params: yearParams },
    { name: 'product history', module: productHistory, method: 'GET', params: yearParams },
    { name: 'summary history', module: productSummaryHistory, method: 'GET', params: yearParams },
    { name: 'variants', module: variants, method: 'GET' },
    { name: 'variant update', module: variant, method: 'PATCH', params: variantParams },
    { name: 'variant removal', module: variant, method: 'DELETE', params: variantParams },
    { name: 'variant copy', module: variantCopy, method: 'POST', params: variantParams },
    { name: 'variant order', module: variantOrder, method: 'PUT', params: groupParams },
    { name: 'summary', module: summary, method: 'GET' },
    { name: 'import', module: imports, method: 'POST' },
    { name: 'review statuses', module: productReview, method: 'PATCH' },
    { name: 'user profiles', module: userProfiles, method: 'GET' },
    { name: 'user profile update', module: userProfile, method: 'PUT', params: { email: 'user@example.com' } },
];

describe('next API route boundary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(runApiHandler).mockResolvedValue(new Response('handled'));
    });

    it.each(routes)('$name forwards the $method request and route parameters', async ({ module, method, params }) => {
        const request = new NextRequest('http://localhost/api/v1/test', { method });
        const route = module[method] as (
            request: NextRequest,
            context: { params: Promise<Record<string, string>> }
        ) => Promise<Response>;
        const response = await route(request, { params: Promise.resolve(params ?? {}) });
        const invocation = vi.mocked(runApiHandler).mock.calls[0];

        expect(response.status).toBe(200);
        expect(invocation[0]).toBe(request);
        expect(invocation[1]).toStrictEqual(expect.any(Function));
        expect(invocation[2]).toStrictEqual(params);
    });
});
