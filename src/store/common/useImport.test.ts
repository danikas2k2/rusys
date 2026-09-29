import { renderHook } from '@testing-library/react';

import { importArchive } from '~/server/actions/archive';
import { useImport } from '~/store/common/useImport';

vi.mock(import('~/server/actions/archive'), () => ({ importArchive: vi.fn() }));

describe('useImport', () => {
    it('sends the archive to a Server Action', async () => {
        const data = new FormData();
        const { result } = renderHook(() => useImport());
        await result.current(data);

        expect(importArchive).toHaveBeenCalledWith(data);
    });
});
