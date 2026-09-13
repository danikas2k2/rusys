import { renderHook } from '@testing-library/react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { useExport } from '~/client/state/common/useExport';

vi.mock(import('~/client/state/common/useApiRequest'));

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
