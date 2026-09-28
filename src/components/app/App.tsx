import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState } from 'react';

import { AppContent } from '~/components/app/AppContent';
import { Error } from '~/components/common/Error';
import { Label } from '~/components/common/Label';
import { ScreenLoader } from '~/components/common/ScreenLoader';
import { useUnderDevelopment } from '~/lib/hooks/useUnderDevelopment';
import { useGoogleClientId } from '~/store/google/useGoogleClientId';

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
