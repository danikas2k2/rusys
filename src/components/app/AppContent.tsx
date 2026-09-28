import React from 'react';

import { AppRouter } from '~/components/app/AppRouter';
import { ErrorDialog } from '~/components/common/ErrorDialog';
import { ActiveContentWrapper } from '~/components/runtime/ActiveContentContext';
import { LoginButton } from '~/components/user/LoginButton';
import { LogoutButton } from '~/components/user/LogoutButton';
import { useUnderDevelopment } from '~/lib/hooks/useUnderDevelopment';
import { useProfile } from '~/store/profile/useProfile';
import { useSyncUserProfile } from '~/store/profile/useSyncUserProfile';

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
