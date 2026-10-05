import { renderHook } from '@testing-library/react';

import { useImport } from '~/lib/hooks/useImport';
import { uploadWithProgress } from '~/lib/utils/uploadWithProgress';

vi.mock(import('~/lib/utils/uploadWithProgress'), () => ({ uploadWithProgress: vi.fn() }));

describe('useImport', () => {
    afterEach(() => vi.clearAllMocks());

    it('uploads the archive and forwards progress', async () => {
        const data = new FormData();
        const onProgress = vi.fn();
        const { result } = renderHook(() => useImport());
        await result.current(data, onProgress);

        expect(uploadWithProgress).toHaveBeenCalledWith('POST', '/api/v1/imports', data, onProgress);
    });

    it('exposes the server validation message to the caller', async () => {
        vi.mocked(uploadWithProgress).mockRejectedValueOnce(new Error('Invalid archive'));
        const { result } = renderHook(() => useImport());

        await expect(result.current(new FormData())).rejects.toThrow('Invalid archive');
    });
});
