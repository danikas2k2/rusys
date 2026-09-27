import { NextRequest } from 'next/server';

import { runApiHandler } from '~/server/api/next';

describe('runApiHandler', () => {
    it('passes JSON, route params and repeated query values to the handler', async () => {
        const request = new NextRequest('http://localhost/api/items?tag=first&tag=second&sort=name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Avietės' }),
        });
        const response = await runApiHandler(
            request,
            (req, res) => {
                expect(req.body).toStrictEqual({ name: 'Avietės' });
                expect(req.params).toStrictEqual({ group: 'Uogienės' });
                expect(req.query).toStrictEqual({ tag: ['first', 'second'], sort: 'name' });

                res.status(201).location('/api/items/1').json({ created: true });
            },
            { group: 'Uogienės' }
        );

        expect(response.status).toBe(201);
        expect(response.headers.get('Location')).toBe('/api/items/1');
        expect(response.headers.get('Content-Type')).toContain('application/json');
        expect(response.headers.get('Cache-Control')).toContain('no-store');
        await expect(response.json()).resolves.toStrictEqual({ created: true });
    });

    it('extracts an uploaded file and returns an empty 204 response', async () => {
        const form = new FormData();
        form.append('import', new File(['backup contents'], 'backup.zip', { type: 'application/zip' }));
        const request = new NextRequest('http://localhost/api/imports', { method: 'POST', body: form });
        const response = await runApiHandler(request, (req, res) => {
            expect(req.files?.import).toStrictEqual({ data: Buffer.from('backup contents') });
            expect(req.body).toStrictEqual({});

            res.status(204).end();
        });

        expect(response.status).toBe(204);
        await expect(response.text()).resolves.toBe('');
    });

    it('ignores unrelated content types and missing upload fields', async () => {
        const plain = new NextRequest('http://localhost/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: 'ignored',
        });
        const plainResponse = await runApiHandler(plain, (req, res) => {
            expect(req.body).toStrictEqual({});
            expect(req.files).toBeUndefined();

            res.send('ok');
        });

        await expect(plainResponse.text()).resolves.toBe('ok');

        const form = new FormData();
        form.append('other', 'not a file');
        const multipart = new NextRequest('http://localhost/api/imports', { method: 'POST', body: form });
        const multipartResponse = await runApiHandler(multipart, (req, res) => {
            expect(req.files).toBeUndefined();

            res.end('missing');
        });

        await expect(multipartResponse.text()).resolves.toBe('missing');
    });

    it('turns a handler exception into a JSON 500 response', async () => {
        const request = new NextRequest('http://localhost/api/items');
        const response = await runApiHandler(request, () => {
            throw new Error('database unavailable');
        });

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toStrictEqual({
            error: { code: 'INTERNAL_ERROR', message: 'Error: database unavailable' },
        });
    });
});
