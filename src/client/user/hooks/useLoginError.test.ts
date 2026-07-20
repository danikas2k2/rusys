import { renderHook } from '@testing-library/react';

import { useResetProfile } from '~/client/state/profile/useResetProfile';
import { useLoginError } from '~/client/user/hooks/useLoginError';

vi.mock(import('~/client/state/profile/useResetProfile'));

describe('useLoginError', () => {
    it('calls resetProfile when invoked', () => {
        const resetProfile = vi.fn();
        vi.mocked(useResetProfile).mockReturnValue(resetProfile);

        const { result } = renderHook(() => useLoginError());
        result.current();

        expect(resetProfile).toHaveBeenCalledWith();
    });
});
