import { useCallback } from 'react';

import { useResetProfile } from '~/components/user/hooks/useResetProfile';

export function useLoginError(): () => void {
    const resetProfile = useResetProfile();
    return useCallback(() => resetProfile(), [resetProfile]);
}
