import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { useQuickFilterContext } from '~/client/filters/QuickFilterContext';
import { ToolbarFilter } from '~/client/toolbar/ToolbarFilter';

vi.mock('~/client/filters/QuickFilterContext', async () => ({
    useQuickFilterContext: vi.fn(),
}));

describe('<ToolbarFilter>', () => {
    const setFilter = vi.fn();

    beforeEach(() => vi.mocked(useQuickFilterContext).mockReturnValue(['', setFilter]));

    afterEach(() => vi.clearAllMocks());

    it('renders input field with placeholder', () => {
        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('type to filter')).toBeInTheDocument();
    });

    it('updates filter value when input field is changed', async () => {
        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        await user.type(screen.getByPlaceholderText('type to filter'), 'x');

        expect(setFilter).toHaveBeenCalledWith('x');
    });

    it('clears filter value when clear button is clicked', async () => {
        vi.mocked(useQuickFilterContext).mockReturnValue(['x', setFilter]);

        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(setFilter).toHaveBeenCalledWith('');
    });
});
