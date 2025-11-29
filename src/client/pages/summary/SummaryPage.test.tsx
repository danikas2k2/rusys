import { render, screen } from '@testing-library/react';
import { MockRoute } from '@tests/MockRoute';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { SummaryPage } from '~/client/pages/summary/SummaryPage';

vi.mock('~/client/pages/summary/SummaryTable', async () => ({
    SummaryTable: () => <div>SummaryTable</div>,
}));
vi.mock('~/client/toolbar/Toolbar', async () => ({
    Toolbar: () => <div>Toolbar</div>,
}));

describe('<SummaryPage>', () => {
    it('renders into the document', () => {
        render(
            <MockTheme>
                <MockRoute>
                    <SummaryPage />
                </MockRoute>
            </MockTheme>
        );

        expect(screen.getByText('SummaryTable')).toBeInTheDocument();
        expect(screen.getByText('Toolbar')).toBeInTheDocument();
    });
});
