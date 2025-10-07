import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';

import { AboutPage } from '~/client/app/AboutPage';
import { DetailsPage } from '~/client/app/details/DetailsPage';
import { GroupsPage } from '~/client/app/groups/GroupsPage';
import { Links } from '~/client/app/Links';
import { SummaryPage } from '~/client/app/summary/SummaryPage';
import { VariantsPage } from '~/client/app/variants/VariantsPage';

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
