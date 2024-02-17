import React from 'react';
import { DetailsTable } from '~/client/details/DetailsTable';
import { Toolbar } from '~/client/toolbar/Toolbar';

export function DetailsPage() {
    return (
        <>
            <Toolbar />
            <DetailsTable />
        </>
    );
}
