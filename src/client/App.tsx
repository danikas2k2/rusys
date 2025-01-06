import DangerousIcon from '@icons/Dangerous.svg';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import Loader from '@ui/Loader';
import { isEqual } from 'lodash';
import React, { memo } from 'react';
import AppContent from '~/client/AppContent';
import useLabel from '~/client/hooks/useLabel';
import { useDev } from '~/hooks/useDev';
import useClientId from '~/store/google/useClientId';
import useLocale from '~/store/locale/useLocale';
import cx from './App.less';

export default memo(function App() {
    useDocumentColorScheme();
    useLocale(process.env.LOCALE);
    const clientId = useClientId();
    const invalidClientId = useLabel('Invalid Client ID');
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
                    <div className={cx('error')}>
                        <DangerousIcon />
                        {invalidClientId}
                    </div>
                )
            )}
        </div>
    );
}, isEqual);
