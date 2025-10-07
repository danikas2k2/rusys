import React from 'react';

import { AppRouter } from '~/client/app/AppRouter';
import { LoginButton } from '~/client/app/user/LoginButton';
import { LogoutButton } from '~/client/app/user/LogoutButton';
import { useProfile } from '~/client/state/profile/useProfile';
import { isDevMode } from '~/common/utils/env';

export function AppContent() {
    const dev = isDevMode();
    const profile = useProfile();
    if (!dev) {
        if (!profile.sub) {
            return <LoginButton />;
        }
        if (!profile.allowed) {
            return <LogoutButton />;
        }
    }
    return <AppRouter />;
}
