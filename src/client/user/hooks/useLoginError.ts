import { useCallback } from 'react';

import { useResetProfile } from '~/client/state/profile/useResetProfile';

export function useLoginError(): () => void {
    const resetProfile = useResetProfile();
    return useCallback(() => resetProfile(), [resetProfile]);
}
