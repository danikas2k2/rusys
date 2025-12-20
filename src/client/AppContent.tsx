import React from 'react';

import { AppRouter } from '~/client/AppRouter';
import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { ErrorDialog } from '~/client/common/ErrorDialog';
import { useUnderDevelopment } from '~/client/hooks/useUnderDevelopment';
import { useProfile } from '~/client/state/profile/useProfile';
import { useSyncUserProfile } from '~/client/state/profile/useSyncUserProfile';
import { LoginButton } from '~/client/user/LoginButton';
import { LogoutButton } from '~/client/user/LogoutButton';

export function AppContent() {
    const profile = useProfile();
    useSyncUserProfile();

    if (!useUnderDevelopment()) {
        if (!profile.sub) {
            return <LoginButton />;
        }
        if (!profile.allowed) {
            return <LogoutButton />;
        }
    }

    return (
        <ActiveContentWrapper>
            <AppRouter />
            <ErrorDialog />
        </ActiveContentWrapper>
    );
}
