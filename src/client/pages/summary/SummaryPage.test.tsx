import { render, screen } from '@testing-library/react';
import { MockRoute } from '@tests/MockRoute';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { SummaryPage } from '~/client/pages/summary/SummaryPage';

jest.mock('~/client/pages/summary/SummaryTable', () => ({
    SummaryTable: () => <div>SummaryTable</div>,
}));
jest.mock('~/client/toolbar/Toolbar', () => ({
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
