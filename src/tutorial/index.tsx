import ButtonArticle from '~/tutorial/articles/Button.mdx';
import ButtonGroupArticle from '~/tutorial/articles/ButtonGroup.mdx';
import CheckboxArticle from '~/tutorial/articles/Checkbox.mdx';
import InputArticle from '~/tutorial/articles/Input.mdx';
import type { FunctionComponent } from 'react';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import './index.less';

const PAGES: Record<string, [string, FunctionComponent]> = {
    button: ['Button', ButtonArticle],
    'button-group': ['ButtonGroup', ButtonGroupArticle],
    checkbox: ['Checkbox', CheckboxArticle],
    Input: ['Input', InputArticle],
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
