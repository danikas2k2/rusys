import { renderHook } from '@testing-library/react';

import { useLoginError } from '~/client/user/hooks/useLoginError';
import { useResetProfile } from '~/state/profile/useResetProfile';

jest.mock('~/state/profile/useResetProfile');

describe('useLoginError', () => {
    it('calls resetProfile when invoked', () => {
        const resetProfile = jest.fn();
        jest.mocked(useResetProfile).mockReturnValue(resetProfile);

        const { result } = renderHook(() => useLoginError());
        result.current();

        expect(resetProfile).toHaveBeenCalledWith();
    });
});
