import React, { type JSX } from 'react';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';

import { ColorSchemeToggle } from '@ui/ColorSchemeToggle';
import { useDocumentColorScheme } from '@ui/hooks/useDocumentColorScheme';

import { PAGES } from '~/tutorial/pages';
import cx from './Tutorial.pcss';

export function Tutorial(): JSX.Element {
    useDocumentColorScheme();
    return (
        <HashRouter>
            <div className={cx('Page')}>
                <aside>
                    <div className={cx('ColorToggle')}>
                        <ColorSchemeToggle />
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
