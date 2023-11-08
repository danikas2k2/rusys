import ColorSchemeToggler from '@ui/ColorSchemeToggler';
import React, { type FunctionComponent } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import ButtonArticle from '~/tutorial/articles/Button.mdx';
import CheckboxArticle from '~/tutorial/articles/Checkbox.mdx';
import ColorsArticle from '~/tutorial/articles/Colors.mdx';
import InputArticle from '~/tutorial/articles/Input.mdx';
import MenuArticle from '~/tutorial/articles/Menu.mdx';
import './index.less';

const PAGES: Record<string, [string, FunctionComponent]> = {
    colors: ['Colors', ColorsArticle],
    button: ['Button', ButtonArticle],
    checkbox: ['Checkbox', CheckboxArticle],
    Input: ['Input', InputArticle],
    Menu: ['Menu', MenuArticle],
};

const container = document.getElementById('root');

if (!container) {
    // eslint-disable-next-line no-console
    console.error('No #root container found');
} else {
    createRoot(container).render(
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
