import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { Links } from '~/client/Links';
import SummaryMenu from '~/client/toolbar/SummaryMenu';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('SummaryMenu', () => {
    it('renders add and statistics menu items', async () => {
        render(
            <MemoryRouter initialEntries={[Links.SUMMARY]}>
                <Routes>
                    <Route path="*" element={<SummaryMenu />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        expect(screen.getByRole('menuitem', { name: 'List' })).toBeInTheDocument();
    });

    it('navigates to summary page when details menu item is clicked', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);

        render(
            <MemoryRouter initialEntries={[Links.SUMMARY]}>
                <Routes>
                    <Route path="*" element={<SummaryMenu />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        await userEvent.click(screen.getByRole('menuitem', { name: 'List' }));
        expect(navigate).toHaveBeenCalledWith(Links.DETAILS);
    });
});
