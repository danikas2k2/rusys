import { renderHook } from '@testing-library/react';

import { useApiRequest } from '~/client/state/common/useApiRequest';
import { useExport } from '~/client/state/common/useExport';
import { ApiUrl } from '~/types/api';

jest.mock('~/client/state/common/useApiRequest');

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
