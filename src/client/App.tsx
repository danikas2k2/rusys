import React from 'react';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import { Loader } from '@ui/Loader';
import { AppContent } from '~/client/AppContent';
import { Label } from '~/client/common/Label';
import { LocaleContext } from '~/client/common/LocaleContext';
import { Error } from '~/client/Error';
import { isDevMode } from '~/common/utils/env';
import { useClientId } from '~/state/google/useClientId';
import { GoogleOAuthProvider } from '@react-oauth/google';
import cx from './App.less';

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
