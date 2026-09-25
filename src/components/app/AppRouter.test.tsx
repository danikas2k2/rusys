import { render, screen } from '@testing-library/react';

import React from 'react';

import { AppRouter } from '~/components/app/AppRouter';

vi.mock(import('~/features/products/ProductsPage'), () => ({
    ProductsPage: () => <div>ProductsPage</div>,
}));
vi.mock(import('~/features/summary/SummaryPage'), () => ({
    SummaryPage: () => <div>SummaryPage</div>,
}));

describe('appRouter component', () => {
    it('renders SummaryPage at route /summary', () => {
        window.history.pushState({}, '', '/summary');

        render(<AppRouter />);

        expect(screen.getByText('SummaryPage')).toBeInTheDocument();
    });

    it('renders ProductsPage at route /products', () => {
        window.history.pushState({}, '', '/products');

        render(<AppRouter />);

        expect(screen.getByText('ProductsPage')).toBeInTheDocument();
    });

    it('renders ProductsPage at unknown route', () => {
        window.history.pushState({}, '', '/unknown');

        render(<AppRouter />);

        expect(screen.getByText('ProductsPage')).toBeInTheDocument();
    });
});
