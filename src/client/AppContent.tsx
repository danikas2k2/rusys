import React from 'react';
import { AppRouter } from '~/client/AppRouter';
import { LoginButton } from '~/client/user/LoginButton';
import { LogoutButton } from '~/client/user/LogoutButton';
import { useDev } from '~/hooks/useDev';
import { useProfile } from '~/state/profile/useProfile';

export function AppContent() {
    const dev = useDev();
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
