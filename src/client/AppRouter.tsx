import React from 'react';
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';

import { GroupFilterWrapper } from '~/client/filters/GroupFilterContext';
import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
import { Links } from '~/client/Links';
import { GroupsPage } from '~/client/pages/groups/GroupsPage';
import { ProductsPage } from '~/client/pages/products/ProductsPage';
import { SummaryPage } from '~/client/pages/summary/SummaryPage';
import { VariantsPage } from '~/client/pages/variants/VariantsPage';

function QuickFilterLayout() {
    return (
        <QuickFilterWrapper>
            <Outlet />
        </QuickFilterWrapper>
    );
}

function GroupFilterLayout() {
    return (
        <GroupFilterWrapper>
            <Outlet />
        </GroupFilterWrapper>
    );
}

export function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path={Links.GROUPS} element={<GroupsPage />} />
                <Route element={<GroupFilterLayout />}>
                    <Route path={Links.VARIANTS} element={<VariantsPage />} />
                    <Route element={<QuickFilterLayout />}>
                        <Route path={Links.SUMMARY} element={<SummaryPage />} />
                        <Route path={Links.PRODUCTS} element={<ProductsPage />} />
                        <Route path="*" element={<ProductsPage />} />
                    </Route>
                </Route>
            </Routes>
        </HashRouter>
    );
}
