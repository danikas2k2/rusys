import { GoogleOAuthProvider } from '@react-oauth/google';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import Loader from '@ui/Loader';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { memo } from 'react';
import AppContent from '~/client/AppContent';
import { Error } from '~/client/Error';
import { useLabel } from '~/client/hooks/useLabel';
import { useDev } from '~/hooks/useDev';
import { useClientId } from '~/state/google/useClientId';
import { useLocale } from '~/state/locale/useLocale';
import './App.less';

export default memo(function App() {
    useDocumentColorScheme();
    useLocale(process.env.LOCALE);
    const clientId = useClientId();
    const invalidClientId = useLabel('Invalid Client ID');
    const dev = useDev();
    return (
        <div className={classNames('App', { center: !dev && !clientId })}>
            {dev ? (
                <AppContent />
            ) : clientId ? (
                <GoogleOAuthProvider clientId={clientId}>
                    <AppContent />
                </GoogleOAuthProvider>
            ) : (
                (clientId == null && <Loader />) || <Error>{invalidClientId}</Error>
            )}
        </div>
    );
}, isEqual);
