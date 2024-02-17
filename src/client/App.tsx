import { GoogleOAuthProvider } from '@react-oauth/google';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import { Loader } from '@ui/Loader';
import React from 'react';
import { AppContent } from '~/client/AppContent';
import { Error } from '~/client/Error';
import { Label } from '~/client/Label';
import { useDev } from '~/hooks/useDev';
import { useClientId } from '~/state/google/useClientId';
import { useLocale } from '~/state/locale/useLocale';
import cx from './App.less';

export function App() {
    useDocumentColorScheme();
    useLocale(process.env.LOCALE);
    const clientId = useClientId();
    const dev = useDev();
    return (
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
    );
}
