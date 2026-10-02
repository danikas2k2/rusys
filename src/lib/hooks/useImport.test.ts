import { renderHook } from '@testing-library/react';

import { useImport } from '~/lib/hooks/useImport';
import { importArchive } from '~/server/actions/archive';

vi.mock(import('~/server/actions/archive'), () => ({ importArchive: vi.fn() }));

describe('useImport', () => {
    afterEach(() => vi.clearAllMocks());

    it('sends the archive to a Server Action', async () => {
        const data = new FormData();
        const { result } = renderHook(() => useImport());
        await result.current(data);

        expect(importArchive).toHaveBeenCalledWith(data);
    });

    it('exposes the server validation message to the caller', async () => {
        vi.mocked(importArchive).mockResolvedValueOnce('Invalid archive');
        const { result } = renderHook(() => useImport());

        await expect(result.current(new FormData())).rejects.toThrow('Invalid archive');
    });
});
