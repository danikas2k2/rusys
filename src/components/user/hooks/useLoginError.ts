import { useCallback } from 'react';

import { useResetProfile } from '~/store/profile/useResetProfile';

export function useLoginError(): () => void {
    const resetProfile = useResetProfile();
    return useCallback(() => resetProfile(), [resetProfile]);
}
