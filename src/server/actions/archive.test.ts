import { MAX_IMPORT_FILE_SIZE } from '~/common/utils/files';
import { SchemaError } from '~/schema';
import { exportArchive, importArchive } from '~/server/actions/archive';
import { runServerHandler } from '~/server/api/next';
import { requireSession } from '~/server/auth/session';
import { buildExportArchive } from '~/server/data/exportArchive';

vi.mock(import('~/server/auth/session'));
vi.mock(import('~/server/api/next'));
vi.mock(import('~/server/data/exportArchive'));

describe('importArchive', () => {
    afterEach(() => vi.clearAllMocks());

    it('rejects a malformed form before reading it', async () => {
        await expect(importArchive({} as never)).resolves.toBe('Choose a valid ZIP file');

        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('rejects a form without a file', async () => {
        await expect(importArchive(new FormData())).resolves.toBe('Choose a valid ZIP file');
        expect(runServerHandler).not.toHaveBeenCalled();
    });

    it('rejects multiple files without reading or importing them', async () => {
        const form = new FormData();
        form.append('import', new File(['first'], 'first.zip'));
        form.append('import', new File(['second'], 'second.zip'));

        await expect(importArchive(form)).resolves.toBe(SchemaError.InvalidZipFile);
        expect(runServerHandler).not.toHaveBeenCalled();
    });

    it('rejects an oversized file before reading its bytes', async () => {
        const file = new File(['small'], 'data.zip');
        Object.defineProperty(file, 'size', { value: MAX_IMPORT_FILE_SIZE + 1 });
        const read = vi.spyOn(file, 'arrayBuffer');
        const form = new FormData();
        form.set('import', file);

        await expect(importArchive(form)).resolves.toBe(SchemaError.InvalidZipFile);
        expect(read).not.toHaveBeenCalled();
        expect(runServerHandler).not.toHaveBeenCalled();
    });

    it('passes the uploaded bytes to the import handler', async () => {
        const form = new FormData();
        form.set('import', new File(['archive'], 'data.zip'));
        vi.mocked(runServerHandler).mockResolvedValueOnce(new Response(null, { status: 204 }));

        await expect(importArchive(form)).resolves.toBeUndefined();
        expect(runServerHandler).toHaveBeenCalledWith(expect.any(Function), {
            body: {},
            files: { import: { data: Buffer.from('archive') } },
            params: {},
            query: {},
        });
    });

    it.each([
        [
            new Response(JSON.stringify({ error: { message: 'Bad archive' } }), { status: 400 }),
            SchemaError.ImportFailed,
        ],
        [new Response(JSON.stringify({}), { status: 422 }), SchemaError.ImportFailed],
    ])('returns the import error', async (response, message) => {
        const form = new FormData();
        form.set('import', new File(['archive'], 'data.zip'));
        vi.mocked(runServerHandler).mockResolvedValueOnce(response);

        await expect(importArchive(form)).resolves.toBe(message);
    });

    it('requires a session before reading the form', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(importArchive(new FormData())).rejects.toThrow('Unauthorized');
        expect(runServerHandler).not.toHaveBeenCalled();
    });
});

describe('exportArchive', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns the archive as base64', async () => {
        vi.mocked(buildExportArchive).mockResolvedValueOnce(Buffer.from('archive'));

        await expect(exportArchive()).resolves.toBe(Buffer.from('archive').toString('base64'));
        expect(requireSession).toHaveBeenCalledExactlyOnceWith();
    });

    it('requires a session before building the archive', async () => {
        vi.mocked(requireSession).mockRejectedValueOnce(new Error('Unauthorized'));

        await expect(exportArchive()).rejects.toThrow('Unauthorized');
        expect(buildExportArchive).not.toHaveBeenCalled();
    });
});

vi.mock(import('~/server/db'));
