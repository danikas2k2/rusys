import { Buffer } from 'node:buffer';

import type { NextRequest } from 'next/server';

import { requireSession } from '~/server/auth/session';

export interface ApiUploadedFile {
    data: Buffer;
}

export interface ApiRequest {
    body: unknown;
    files?: Record<string, ApiUploadedFile | ApiUploadedFile[]>;
    params: Record<string, string>;
    query: Record<string, string | string[]>;
}

export interface ApiResponse {
    end: (value?: string | Uint8Array) => ApiResponse;
    json: (value: unknown) => ApiResponse;
    location: (url: string) => ApiResponse;
    send: (value: string | Uint8Array) => ApiResponse;
    setHeader: (name: string, value: string) => ApiResponse;
    status: (code: number) => ApiResponse;
}

export type ApiHandler = (request: ApiRequest, response: ApiResponse) => void | Promise<void>;

interface CapturedResponse extends ApiResponse {
    body?: string | Uint8Array;
    headers: Headers;
    statusCode: number;
}

function createResponse(): CapturedResponse {
    return {
        statusCode: 200,
        headers: new Headers({ 'Cache-Control': 'no-cache, no-store, must-revalidate' }),
        status(code) {
            this.statusCode = code;
            return this;
        },
        setHeader(name, value) {
            this.headers.set(name, value);
            return this;
        },
        location(url) {
            this.headers.set('Location', url);
            return this;
        },
        json(value) {
            this.headers.set('Content-Type', 'application/json; charset=utf-8');
            this.body = JSON.stringify(value);
            return this;
        },
        send(value) {
            this.body = value;
            return this;
        },
        end(value) {
            this.body = value;
            return this;
        },
    };
}

function queryFrom(request: NextRequest): ApiRequest['query'] {
    const query: ApiRequest['query'] = {};
    for (const [key, value] of request.nextUrl.searchParams) {
        const current = query[key];
        query[key] = current === undefined ? value : Array.isArray(current) ? [...current, value] : [current, value];
    }
    return query;
}

async function bodyFrom(request: NextRequest): Promise<Pick<ApiRequest, 'body' | 'files'>> {
    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
        const form = await request.formData();
        const file = form.get('import');
        return file instanceof File
            ? { files: { import: { data: Buffer.from(await file.arrayBuffer()) } }, body: {} }
            : { body: {} };
    }
    return contentType.includes('application/json') ? { body: await request.json() } : { body: {} };
}

export async function runApiHandler(
    request: NextRequest,
    handler: ApiHandler,
    params: ApiRequest['params'] = {}
): Promise<Response> {
    if (request.nextUrl.pathname !== '/api/v1/auth/client-id') {
        try {
            await requireSession();
        } catch {
            return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 });
        }
    }
    return runServerHandler(handler, { ...(await bodyFrom(request)), params, query: queryFrom(request) });
}

export async function runServerHandler(handler: ApiHandler, request: ApiRequest): Promise<Response> {
    const response = createResponse();
    try {
        await handler(request, response);
    } catch (error) {
        response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: `${error}` } });
    }
    return new Response(response.statusCode === 204 ? undefined : (response.body as BodyInit | undefined), {
        headers: response.headers,
        status: response.statusCode,
    });
}
