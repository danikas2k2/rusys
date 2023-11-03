import { isEqual } from 'lodash';
import React, { memo } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import DetailsPage from '~/client/details/DetailsPage';
import { Links } from '~/client/Links';
import SummaryPage from '~/client/summary/SummaryPage';

export default memo(function AppRouter() {
    return (
        <HashRouter>
            <Routes>
                <Route path={Links.SUMMARY} element={<SummaryPage />} />
                <Route path="*" element={<DetailsPage />} />
            </Routes>
        </HashRouter>
    );
}, isEqual);
