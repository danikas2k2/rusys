import { render, screen } from '@testing-library/react';
import { MockPage } from '@tests/MockPage';

import React from 'react';

import { QuickFilterWrapper } from '~/client/filters/QuickFilterContext';
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
            <MockPage state={{ groups: [] }}>
                <SummaryPage />
            </MockPage>
        );

        expect(screen.getByText('SummaryTable')).toBeInTheDocument();
        expect(screen.getByText('Toolbar')).toBeInTheDocument();
    });

    it('only shows categories that have summary data', () => {
        render(
            <MockPage
                state={{
                    groups: [
                        { group: 'Uogienės', order: 0 },
                        { group: 'Daržovės', order: 1 },
                    ],
                    summary: [{ group: 'Uogienės', name: 'Avietės', years: [] }],
                }}
            >
                <SummaryPage />
            </MockPage>
        );

        expect(screen.getByRole('tab', { name: 'Uogienės' })).toBeInTheDocument();
        expect(screen.queryByRole('tab', { name: 'Daržovės' })).not.toBeInTheDocument();
    });

    it('greys out categories whose summary entries are all filtered out', () => {
        render(
            <MockPage
                state={{
                    groups: [
                        { group: 'Uogienės', order: 0 },
                        { group: 'Daržovės', order: 1 },
                    ],
                    summary: [
                        { group: 'Uogienės', name: 'Avietės', years: [] },
                        { group: 'Daržovės', name: 'Agurkai', years: [] },
                    ],
                }}
            >
                <QuickFilterWrapper initialState="avietes">
                    <SummaryPage />
                </QuickFilterWrapper>
            </MockPage>
        );

        const visibleAvatar = screen.getByRole('tab', { name: 'Uogienės' }).querySelector('.mantine-Avatar-root');
        const filteredAvatar = screen.getByRole('tab', { name: 'Daržovės' }).querySelector('.mantine-Avatar-root');

        expect(visibleAvatar).toHaveAttribute('data-grayed', 'false');
        expect(filteredAvatar).toHaveAttribute('data-grayed', 'true');
    });
});
