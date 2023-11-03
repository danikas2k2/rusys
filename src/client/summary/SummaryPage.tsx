import { isEqual } from 'lodash';
import React, { memo } from 'react';
import SummaryTable from '~/client/summary/SummaryTable';
import Toolbar from '~/client/toolbar/Toolbar';

export default memo(function SummaryPage() {
    return (
        <>
            <Toolbar />
            <SummaryTable />
        </>
    );
}, isEqual);
