import { render, screen } from '@testing-library/react';
import React from 'react';
import AppRouter from '~/client/AppRouter';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/client/details/DetailsPage', () => () => <div>DetailsPage</div>);
jest.mock('~/client/summary/SummaryPage', () => () => <div>SummaryPage</div>);

describe('AppRouter component', () => {
    it('renders SummaryPage at route /summary', () => {
        window.history.pushState({}, '', '#/summary');
        render(<AppRouter />, withReduxState());
        expect(screen.getByText('SummaryPage')).toBeInTheDocument();
    });

    it('renders DetailsPage at route /details', () => {
        window.history.pushState({}, '', '#/details');
        render(<AppRouter />, withReduxState());
        expect(screen.getByText('DetailsPage')).toBeInTheDocument();
    });

    it('renders DetailsPage at unknown route', () => {
        window.history.pushState({}, '', '#/unknown');
        render(<AppRouter />, withReduxState());
        expect(screen.getByText('DetailsPage')).toBeInTheDocument();
    });
});
