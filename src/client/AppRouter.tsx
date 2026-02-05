import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { Links } from '~/client/Links';
import { GroupsPage } from '~/client/pages/groups/GroupsPage';
import { ProductsPage } from '~/client/pages/products/ProductsPage';
import { SummaryPage } from '~/client/pages/summary/SummaryPage';
import { VariantsPage } from '~/client/pages/variants/VariantsPage';

export function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path={Links.SUMMARY} element={<SummaryPage />} />
                <Route path={Links.GROUPS} element={<GroupsPage />} />
                <Route path={Links.VARIANTS} element={<VariantsPage />} />
                <Route path={Links.PRODUCTS} element={<ProductsPage />} />
                <Route path="*" element={<ProductsPage />} />
            </Routes>
        </HashRouter>
    );
}
