import { renderHook } from '@testing-library/react';

import { useApiRequest } from '~/store/common/useApiRequest';
import { useExport } from '~/store/common/useExport';

vi.mock(import('~/store/common/useApiRequest'));

describe('useExport', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls export action requesting a blob response', async () => {
        const { result } = renderHook(() => useExport());
        await result.current();

        expect(request).toHaveBeenCalledWith('/api/v1/exports/latest', undefined, 'GET', 'blob');
    });
});
