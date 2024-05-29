import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Links } from '~/client/Links';
import { Toolbar } from '~/client/toolbar/Toolbar';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useSetFilter } from '~/state/filter/useSetFilter';
import { withMany } from '~/tests/withMany';
import { withReduxState } from '~/tests/withReduxState';
import { withRouter } from '~/tests/withRouter';

jest.mock('~/state/filter/useClearFilter');
jest.mock('~/state/filter/useFilter');
jest.mock('~/state/filter/useSetFilter');
jest.mock('~/client/toolbar/ToolbarMenu', () => ({
    ToolbarMenu: () => <div>ToolbarMenu</div>,
}));
jest.mock('~/client/user/LogoutButton', () => ({
    LogoutButton: () => <div>LogoutButton</div>,
}));

describe('Toolbar', () => {
    beforeEach(() => {
        (useFilter as jest.Mock).mockReturnValue('');
        (useSetFilter as jest.Mock).mockReturnValue(jest.fn());
        (useClearFilter as jest.Mock).mockReturnValue(jest.fn());
    });

    afterEach(() => jest.clearAllMocks());

    it('renders input field with placeholder', () => {
        render(<Toolbar />, withMany(withRouter([Links.DETAILS]), withReduxState()));

        expect(screen.getByPlaceholderText('type to filter')).toBeInTheDocument();
    });

    it('renders ToolbarMenu', () => {
        render(<Toolbar />, withMany(withRouter([Links.DETAILS]), withReduxState()));

        expect(screen.getByText('ToolbarMenu')).toBeInTheDocument();
    });

    it('renders LogoutButton', () => {
        render(<Toolbar />, withMany(withRouter([Links.DETAILS]), withReduxState()));

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('updates filter value when input field is changed', async () => {
        const setFilter = jest.fn();
        (useSetFilter as jest.Mock).mockReturnValue(setFilter);

        render(<Toolbar />, withMany(withRouter([Links.DETAILS]), withReduxState()));

        await userEvent.type(screen.getByPlaceholderText('type to filter'), 'x');
        expect(setFilter).toHaveBeenCalledWith('x');
    });

    it('clears filter value when clear button is clicked', async () => {
        const clearFilter = jest.fn();
        (useClearFilter as jest.Mock).mockReturnValue(clearFilter);
        (useFilter as jest.Mock).mockReturnValue('x');

        render(<Toolbar />, withMany(withRouter([Links.DETAILS]), withReduxState()));

        await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
        expect(clearFilter).toHaveBeenCalled();
    });
});
