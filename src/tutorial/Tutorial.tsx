import ColorSchemeToggler from '@ui/ColorSchemeToggler';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';
import React from 'react';
import { Route, Routes } from 'react-router';
import { HashRouter, NavLink } from 'react-router-dom';
import { PAGES } from '~/tutorial/pages';
import './Tutorial.less';

export function Tutorial(): JSX.Element {
    useDocumentColorScheme();
    return (
        <HashRouter>
            <div className="Page">
                <aside>
                    <div className="ColorToggler">
                        <ColorSchemeToggler />
                    </div>
                    {Object.entries(PAGES).map(([key, [title]]) => (
                        <NavLink key={key} to={`/${key}`}>
                            {title}
                        </NavLink>
                    ))}
                </aside>
                <Routes>
                    {Object.entries(PAGES).map(([key, [, Component]], i) => (
                        <>
                            {!i && <Route key="default" path="/" element={<Component />} />}
                            <Route key={key} path={`/${key}`} element={<Component />} />
                        </>
                    ))}
                </Routes>
            </div>
        </HashRouter>
    );
}
