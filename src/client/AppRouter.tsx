import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { AboutPage } from '~/client/AboutPage';
import { DetailsPage } from '~/client/details/DetailsPage';
import { GroupsPage } from '~/client/groups/GroupsPage';
import { Links } from '~/client/Links';
import { SummaryPage } from '~/client/summary/SummaryPage';
import { VariantsPage } from '~/client/variants/VariantsPage';

export function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path={Links.ABOUT} element={<AboutPage />} />
                <Route path={Links.SUMMARY} element={<SummaryPage />} />
                <Route path={Links.GROUPS} element={<GroupsPage />} />
                <Route path={Links.VARIANTS} element={<VariantsPage />} />
                <Route path={Links.DETAILS} element={<DetailsPage />} />
                <Route path="*" element={<DetailsPage />} />
            </Routes>
        </HashRouter>
    );
}
