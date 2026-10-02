import { renderHook } from '@testing-library/react';

import { useExport } from '~/lib/hooks/useExport';
import { exportArchive } from '~/server/actions/archive';

vi.mock(import('~/server/actions/archive'), () => ({ exportArchive: vi.fn() }));

describe('useExport', () => {
    it('converts the Server Action archive into a ZIP blob', async () => {
        vi.mocked(exportArchive).mockResolvedValue(btoa('archive'));
        const { result } = renderHook(() => useExport());
        const blob = await result.current();

        expect(blob.type).toBe('application/zip');
        await expect(blob.text()).resolves.toBe('archive');
    });
});
