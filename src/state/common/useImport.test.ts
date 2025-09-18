import { renderHook } from '@testing-library/react';

import { useApiRequest } from '~/common/hooks/useApiRequest';
import { useImport } from '~/state/common/useImport';
import { ApiUrl } from '~/types/api';

jest.mock('~/common/hooks/useApiRequest');

describe('useImport', () => {
    const request = jest.fn();

    beforeAll(() => jest.mocked(useApiRequest).mockReturnValue(request));

    afterEach(() => jest.clearAllMocks());

    it('calls import action', async () => {
        const data = new FormData();

        const { result } = renderHook(() => useImport());
        await result.current(data);

        expect(request).toHaveBeenCalledWith(ApiUrl.Import, data);
    });
});
