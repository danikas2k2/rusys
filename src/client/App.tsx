import { locale } from '@config';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Loader from '@ui/Loader';
import classNames from 'classnames';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import TablePage from '~/pages/TablePage';
import LoginButton from '~/client/user/LoginButton';
import LogoutButton from '~/client/user/LogoutButton';
import useClientId from '~/store/google/useClientId';
import useLocale from '~/store/locale/useLocale';
import './App.less';
import useProfile from '~/store/profile/useProfile';

export default function App(): JSX.Element {
    useLocale(locale);
    const clientId = useClientId();
    const profile = useProfile();
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="*"
                    element={
                        <div className={classNames('App', { center: !clientId })}>
                            {clientId ? (
                                <GoogleOAuthProvider clientId={clientId}>
                                    {profile.sub ? (
                                        (profile.allowed && <TablePage />) || <LogoutButton />
                                    ) : (
                                        <LoginButton />
                                    )}
                                </GoogleOAuthProvider>
                            ) : (
                                <Loader />
                            )}
                        </div>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
