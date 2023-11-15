import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { Links } from '~/client/Links';
import DetailsMenu from '~/client/toolbar/DetailsMenu';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));
jest.mock('~/client/details/dialogs/EditBox', () => ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>EditBox</button>
));

describe('DetailsMenu', () => {
    it('renders add and statistics menu items', async () => {
        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<DetailsMenu />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        expect(screen.getByRole('menuitem', { name: 'Add' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Statistics' })).toBeInTheDocument();
    });

    it('opens EditBox when add menu item is clicked', async () => {
        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<DetailsMenu />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));
        expect(screen.getByRole('button', { name: 'EditBox' })).toBeInTheDocument();
    });

    it('closes EditBox when close button is clicked', async () => {
        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<DetailsMenu />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        await userEvent.click(screen.getByRole('menuitem', { name: 'Add' }));
        await userEvent.click(screen.getByRole('button', { name: 'EditBox' }));
        expect(screen.queryByRole('button', { name: 'EditBox' })).not.toBeInTheDocument();
    });

    it('navigates to summary page when statistics menu item is clicked', async () => {
        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);

        render(
            <MemoryRouter initialEntries={[Links.DETAILS]}>
                <Routes>
                    <Route path="*" element={<DetailsMenu />} />
                </Routes>
            </MemoryRouter>,
            withReduxState()
        );

        await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
        await userEvent.click(screen.getByRole('menuitem', { name: 'Statistics' }));
        expect(navigate).toHaveBeenCalledWith(Links.SUMMARY);
    });
});
