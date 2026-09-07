import { renderHook } from '@testing-library/react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { useImport } from '~/client/state/common/useImport';

vi.mock(import('~/client/state/common/useApiRequest'));

describe('useImport', () => {
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('calls import action', async () => {
        const data = new FormData();

        const { result } = renderHook(() => useImport());
        await result.current(data);

        expect(request).toHaveBeenCalledWith('/api/v1/imports', data, 'POST');
    });
});
