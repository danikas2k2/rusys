import React from 'react';

import { AppRouter } from '~/client/AppRouter';
import { ActiveContentWrapper } from '~/client/common/ActiveContentContext';
import { ErrorDialog } from '~/client/common/ErrorDialog';
import { useProfile } from '~/client/state/profile/useProfile';
import { LoginButton } from '~/client/user/LoginButton';
import { LogoutButton } from '~/client/user/LogoutButton';
import { isDevMode } from '~/common/utils/env';

export function AppContent() {
    const profile = useProfile();
    if (!isDevMode()) {
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
