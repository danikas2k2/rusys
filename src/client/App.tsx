import Dangerous from '@icons/Dangerous.svg';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Loader from '@ui/Loader';
import classNames from 'classnames';
import React, { type JSX } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useDev } from '~/hooks/useDev';
import useLabel from '~/client/hooks/useLabel';
import LoginButton from '~/client/user/LoginButton';
import LogoutButton from '~/client/user/LogoutButton';
import TablePage from '~/pages/TablePage';
import useClientId from '~/store/google/useClientId';
import useLocale from '~/store/locale/useLocale';
import useProfile from '~/store/profile/useProfile';
import './App.less';

export function AppContent(): JSX.Element {
    const dev = useDev();
    const profile = useProfile();
    if (dev) {
        return <TablePage />;
    }
    return profile.sub ? (profile.allowed && <TablePage />) || <LogoutButton /> : <LoginButton />;
}

export default function App(): JSX.Element {
    useLocale(process.env.LOCALE);
    const clientId = useClientId();
    const invalidClientId = useLabel('Invalid Client ID');
    const dev = useDev();

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="*"
                    element={
                        <div className={classNames('App', { center: !dev && !clientId })}>
                            {dev ? (
                                <AppContent />
                            ) : clientId ? (
                                <GoogleOAuthProvider clientId={clientId}>
                                    <AppContent />
                                </GoogleOAuthProvider>
                            ) : (
                                (clientId === null && <Loader />) || (
                                    <div className={classNames('error')}>
                                        <Dangerous />
                                        {invalidClientId}
                                    </div>
                                )
                            )}
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
