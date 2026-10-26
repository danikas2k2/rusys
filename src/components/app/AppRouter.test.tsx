import { render, screen } from '@testing-library/react';

import React from 'react';

import { AppRouter } from '~/components/app/AppRouter';
import { trackFaroEvent } from '~/lib/observability/faro';

vi.mock(import('~/lib/observability/faro'), () => ({ trackFaroEvent: vi.fn() }));
vi.mock(import('~/store/groups/useGroups'), () => ({ useGroups: () => [] }));

vi.mock(import('~/features/products/ProductsPage'), () => ({
    ProductsPage: () => <div>ProductsPage</div>,
}));
vi.mock(import('~/features/summary/SummaryPage'), () => ({
    SummaryPage: () => <div>SummaryPage</div>,
}));
vi.mock(import('~/features/groups/GroupsPage'), () => ({
    GroupsPage: () => <div>GroupsPage</div>,
}));
vi.mock(import('~/features/variants/VariantsPage'), () => ({
    VariantsPage: () => <div>VariantsPage</div>,
}));

describe('appRouter component', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders GroupsPage at route /categories', () => {
        window.history.pushState({}, '', '/categories');
        render(<AppRouter />);

        expect(screen.getByText('GroupsPage')).toBeInTheDocument();
        expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('navigation', { page: 'categories' });
    });

    it('renders VariantsPage at route /variants', () => {
        window.history.pushState({}, '', '/variants');
        render(<AppRouter />);

        expect(screen.getByText('VariantsPage')).toBeInTheDocument();
    });

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
        expect(trackFaroEvent).not.toHaveBeenCalled();
    });
});
