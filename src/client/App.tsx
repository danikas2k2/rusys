import React, { useState } from 'react';

import { GoogleOAuthProvider } from '@react-oauth/google';

import { AppContent } from '~/client/AppContent';
import { Error } from '~/client/common/Error';
import { Label } from '~/client/common/Label';
import { LocaleContext } from '~/client/common/LocaleContext';
import { ScreenLoader } from '~/client/common/ScreenLoader';
import { useClientId } from '~/client/state/google/useClientId';
import { isDevMode } from '~/common/utils/env';

export function App() {
    const clientId = useClientId();
    const [error, setError] = useState(false);
    return (
        <LocaleContext value={process.env.LOCALE}>
            <GoogleOAuthProvider clientId={clientId} onScriptLoadError={() => setError(true)}>
                {error ? (
                    <Error>
                        <Label>Failed to load Google OAuth script</Label>
                    </Error>
                ) : clientId || isDevMode() ? (
                    <AppContent />
                ) : (
                    <ScreenLoader />
                )}
            </GoogleOAuthProvider>
        </LocaleContext>
    );
}
