import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState } from 'react';

import { AppContent } from '~/client/AppContent';
import { Error } from '~/client/common/Error';
import { Label } from '~/client/common/Label';
import { ScreenLoader } from '~/client/common/ScreenLoader';
import { useUnderDevelopment } from '~/client/hooks/useUnderDevelopment';
import { useGoogleClientId } from '~/client/state/google/useGoogleClientId';

export function App() {
    const isUnderDevelopment = useUnderDevelopment();
    const clientId = useGoogleClientId();
    const [error, setError] = useState(false);

    if (error) {
        return (
            <Error>
                <Label>Failed to load Google OAuth script</Label>
            </Error>
        );
    }

    if (isUnderDevelopment) {
        return <AppContent />;
    }

    if (!clientId) {
        return <ScreenLoader />;
    }

    return (
        <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => setError(true)}>
            <AppContent />
        </GoogleOAuthProvider>
    );
}
