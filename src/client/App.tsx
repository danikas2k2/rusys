import React from 'react';

import { Loader } from '@mantine/core';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';

import { AppContent } from '~/client/AppContent';
import { Label } from '~/client/common/Label';
import { LocaleContext } from '~/client/common/LocaleContext';
import { Error } from '~/client/Error';
import { useClientId } from '~/client/state/google/useClientId';
import { isDevMode } from '~/common/utils/env';

export function App() {
    useDocumentColorScheme();
    const clientId = useClientId();
    const dev = isDevMode();
    return (
        <LocaleContext value={process.env.LOCALE}>
            {dev ? (
                <AppContent />
            ) : clientId ? (
                <GoogleOAuthProvider clientId={clientId}>
                    <AppContent />
                </GoogleOAuthProvider>
            ) : (
                (clientId == null && <Loader size="lg" type="bars" />) || (
                    <Error>
                        <Label>Invalid Client ID</Label>
                    </Error>
                )
            )}
        </LocaleContext>
    );
}
