import { renderHook } from '@testing-library/react';

import { useLoginError } from '~/components/user/hooks/useLoginError';
import { useResetProfile } from '~/components/user/hooks/useResetProfile';

vi.mock(import('~/components/user/hooks/useResetProfile'));

describe('useLoginError', () => {
    it('calls resetProfile when invoked', () => {
        const resetProfile = vi.fn();
        vi.mocked(useResetProfile).mockReturnValue(resetProfile);

        const { result } = renderHook(() => useLoginError());
        result.current();

        expect(resetProfile).toHaveBeenCalledWith();
    });
});
