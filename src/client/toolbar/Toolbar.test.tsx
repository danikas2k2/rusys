import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Links } from '~/client/Links';
import Toolbar from '~/client/toolbar/Toolbar';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useSetFilter } from '~/state/filter/useSetFilter';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('~/state/filter/useClearFilter');
jest.mock('~/state/filter/useFilter');
jest.mock('~/state/filter/useSetFilter');
jest.mock('~/client/toolbar/ToolbarMenu', () => () => <div>ToolbarMenu</div>);
jest.mock('~/client/user/LogoutButton', () => () => <div>LogoutButton</div>);

describe('Toolbar', () => {
    beforeEach(() => {
        (useFilter as jest.Mock).mockReturnValue('');
        (useSetFilter as jest.Mock).mockReturnValue(jest.fn());
        (useClearFilter as jest.Mock).mockReturnValue(jest.fn());
    });

    afterEach(() => jest.clearAllMocks());

    it('renders input field with placeholder', () => {
        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<Toolbar />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        expect(screen.getByPlaceholderText('type to filter')).toBeInTheDocument();
    });

    it('renders ToolbarMenu', () => {
        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<Toolbar />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        expect(screen.getByText('ToolbarMenu')).toBeInTheDocument();
    });

    it('renders LogoutButton', () => {
        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<Toolbar />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        expect(screen.getByText('LogoutButton')).toBeInTheDocument();
    });

    it('updates filter value when input field is changed', async () => {
        const setFilter = jest.fn();
        (useSetFilter as jest.Mock).mockReturnValue(setFilter);

        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<Toolbar />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.type(screen.getByPlaceholderText('type to filter'), 'x');
        expect(setFilter).toHaveBeenCalledWith('x');
    });

    it('clears filter value when clear button is clicked', async () => {
        const clearFilter = jest.fn();
        (useClearFilter as jest.Mock).mockReturnValue(clearFilter);
        (useFilter as jest.Mock).mockReturnValue('x');

        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<Toolbar />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
        expect(clearFilter).toHaveBeenCalled();
    });
});
