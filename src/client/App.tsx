import React from 'react';

import { Loader } from '@mantine/core';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { AppContent } from '~/client/AppContent';
import { Error } from '~/client/common/Error';
import { Label } from '~/client/common/Label';
import { LocaleContext } from '~/client/common/LocaleContext';
import { useClientId } from '~/client/state/google/useClientId';
import { isDevMode } from '~/common/utils/env';

export function App() {
    const clientId = useClientId();
    return (
        <LocaleContext value={process.env.LOCALE}>
            <GoogleOAuthProvider clientId={clientId}>
                {clientId || isDevMode() ? (
                    <AppContent />
                ) : (
                    (!clientId && <Loader size="lg" type="bars" />) || (
                        <Error>
                            <Label>Invalid Client ID</Label>
                        </Error>
                    )
                )}
            </GoogleOAuthProvider>
        </LocaleContext>
    );
}
