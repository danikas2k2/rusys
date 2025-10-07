import React from 'react';

import { GoogleOAuthProvider } from '@react-oauth/google';

import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import { Loader } from '@ui/Loader';

import { AppContent } from '~/client/app/AppContent';
import { Label } from '~/client/app/common/Label';
import { LocaleContext } from '~/client/app/common/LocaleContext';
import { Error } from '~/client/app/Error';
import { useClientId } from '~/client/state/google/useClientId';
import { isDevMode } from '~/common/utils/env';
import cx from './App.pcss';

export function App() {
    useDocumentColorScheme();
    const clientId = useClientId();
    const dev = isDevMode();
    return (
        <LocaleContext value={process.env.LOCALE}>
            <div className={cx('App', { center: !dev && !clientId })}>
                {dev ? (
                    <AppContent />
                ) : clientId ? (
                    <GoogleOAuthProvider clientId={clientId}>
                        <AppContent />
                    </GoogleOAuthProvider>
                ) : (
                    (clientId == null && <Loader />) || (
                        <Error>
                            <Label>Invalid Client ID</Label>
                        </Error>
                    )
                )}
            </div>
        </LocaleContext>
    );
}
