import { renderHook } from '@testing-library/react';

import { useLoginError } from '~/components/user/hooks/useLoginError';
import { useResetProfile } from '~/store/profile/useResetProfile';

vi.mock(import('~/store/profile/useResetProfile'));

describe('useLoginError', () => {
    it('calls resetProfile when invoked', () => {
        const resetProfile = vi.fn();
        vi.mocked(useResetProfile).mockReturnValue(resetProfile);

        const { result } = renderHook(() => useLoginError());
        result.current();

        expect(resetProfile).toHaveBeenCalledWith();
    });
});
