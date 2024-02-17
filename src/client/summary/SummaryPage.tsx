import React from 'react';
import { SummaryTable } from '~/client/summary/SummaryTable';
import { Toolbar } from '~/client/toolbar/Toolbar';

export function SummaryPage() {
    return (
        <>
            <Toolbar />
            <SummaryTable />
        </>
    );
}
