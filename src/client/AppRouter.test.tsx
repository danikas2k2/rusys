import { render, screen } from '@testing-library/react';

import React from 'react';

import { AppRouter } from '~/client/AppRouter';

jest.mock('~/client/pages/details/DetailsPage', () => ({
    DetailsPage: () => <div>DetailsPage</div>,
}));
jest.mock('~/client/pages/summary/SummaryPage', () => ({
    SummaryPage: () => <div>SummaryPage</div>,
}));

describe('appRouter component', () => {
    it('renders SummaryPage at route /summary', () => {
        window.history.pushState({}, '', '#/summary');

        render(<AppRouter />);

        expect(screen.getByText('SummaryPage')).toBeInTheDocument();
    });

    it('renders DetailsPage at route /details', () => {
        window.history.pushState({}, '', '#/details');

        render(<AppRouter />);

        expect(screen.getByText('DetailsPage')).toBeInTheDocument();
    });

    it('renders DetailsPage at unknown route', () => {
        window.history.pushState({}, '', '#/unknown');

        render(<AppRouter />);

        expect(screen.getByText('DetailsPage')).toBeInTheDocument();
    });
});
