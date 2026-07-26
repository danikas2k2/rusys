import { render, screen } from '@testing-library/react';
import { MockRoute } from '@tests/MockRoute';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { SummaryPage } from '~/client/pages/summary/SummaryPage';

vi.mock(import('~/client/pages/summary/SummaryTable'), () => ({
    SummaryTable: () => <div>SummaryTable</div>,
}));
vi.mock(import('~/client/toolbar/Toolbar'), () => ({
    Toolbar: () => <div>Toolbar</div>,
}));
vi.mock(import('~/client/pages/review/ActiveReviewBox'), () => ({
    ActiveReviewBox: vi.fn(() => null),
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
