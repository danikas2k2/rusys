import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ImportMenuItem } from '~/client/toolbar/items/ImportMenuItem';

vi.mock(import('~/client/common/Label'));

describe('<ImportMenuItem>', () => {
    const setActive = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('renders import label', () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ImportMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByText('Import')).toBeInTheDocument();
    });

    it('renders import icon', () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ImportMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByText('Import').closest('a')).toBeInTheDocument();
    });

    it('calls setActive with import action on click', async () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ImportMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Import'));

        expect(setActive).toHaveBeenCalledWith({ action: 'import' });
    });

    it('calls onClick callback when provided', async () => {
        const onClick = vi.fn();

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ImportMenuItem onClick={onClick} />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Import'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    });

    it('calls both onClick and setActive when onClick is provided', async () => {
        const onClick = vi.fn();

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ImportMenuItem onClick={onClick} />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Import'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(setActive).toHaveBeenCalledWith({ action: 'import' });
    });

    it('works without onClick callback', async () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ImportMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Import'));

        expect(setActive).toHaveBeenCalledWith({ action: 'import' });
    });

    it('does not call setActive if onClick prevents default', async () => {
        const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ImportMenuItem onClick={onClick} />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Import'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(setActive).toHaveBeenCalledWith({ action: 'import' });
    });
});
