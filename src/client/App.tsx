import Dangerous from '@icons/Dangerous.svg';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Loader from '@ui/Loader';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { memo } from 'react';
import AppContent from '~/client/AppContent';
import useLabel from '~/client/hooks/useLabel';
import { useDev } from '~/hooks/useDev';
import useClientId from '~/store/google/useClientId';
import useLocale from '~/store/locale/useLocale';
import './App.less';

export default memo(function App() {
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
                (clientId == null && <Loader />) || (
                    <div className={classNames('error')}>
                        <Dangerous />
                        {invalidClientId}
                    </div>
                )
            )}
        </div>
    );
}, isEqual);
