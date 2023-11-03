import { isEqual } from 'lodash';
import React, { memo } from 'react';
import DetailsTable from '~/client/details/DetailsTable';
import Toolbar from '~/client/toolbar/Toolbar';

export default memo(function DetailsPage() {
    return (
        <>
            <Toolbar />
            <DetailsTable />
        </>
    );
}, isEqual);
