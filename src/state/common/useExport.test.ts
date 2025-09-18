import { renderHook } from '@testing-library/react';

import { useApiRequest } from '~/common/hooks/useApiRequest';
import { useExport } from '~/state/common/useExport';
import { ApiUrl } from '~/types/api';

jest.mock('~/common/hooks/useApiRequest');

describe('useExport', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls export action', async () => {
        const { result } = renderHook(() => useExport());
        await result.current();

        expect(request).toHaveBeenCalledWith(ApiUrl.Export);
    });
});
