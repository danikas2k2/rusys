import { NextRequest } from 'next/server';

import * as productImage from '~/app/api/v1/groups/[group]/products/[name]/image/route';
import * as variantImage from '~/app/api/v1/groups/[group]/products/[name]/variants/[variant]/image/route';
import * as group from '~/app/api/v1/groups/[group]/route';
import * as imports from '~/app/api/v1/imports/route';
import { runApiHandler } from '~/server/api/next';

vi.mock(import('~/server/api/next'), () => ({ runApiHandler: vi.fn() }));

const groupParams = { group: 'Uogienės' };
const productParams = { ...groupParams, name: 'Avietės' };

const routes: readonly {
    name: string;
    module: Record<string, unknown>;
    method: string;
    params?: Record<string, string>;
}[] = [
    { name: 'group update', module: group, method: 'PUT', params: groupParams },
    { name: 'group rename', module: group, method: 'PATCH', params: groupParams },
    { name: 'product image', module: productImage, method: 'PUT', params: productParams },
    { name: 'variant image', module: variantImage, method: 'PUT', params: { ...productParams, variant: 'Stiklainis' } },
    { name: 'import', module: imports, method: 'POST' },
];

describe('next API route boundary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(runApiHandler).mockResolvedValue(new Response('handled'));
    });

    it('does not expose group deletion over HTTP', () => {
        expect(group).not.toHaveProperty('DELETE');
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
