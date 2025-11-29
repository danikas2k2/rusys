import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ExportMenuItem } from '~/client/toolbar/items/ExportMenuItem';

vi.mock('~/client/common/Label');

describe('<ExportMenuItem>', () => {
    const setActive = vi.fn();

    afterEach(() => vi.clearAllMocks());

    it('renders export label', () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ExportMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('calls setActive with export action on click', async () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ExportMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Export'));

        expect(setActive).toHaveBeenCalledWith({ action: 'export' });
    });

    it('calls onClick callback when provided', async () => {
        const onClick = vi.fn();

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ExportMenuItem onClick={onClick} />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Export'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }));
    });

    it('calls both onClick and setActive when onClick is provided', async () => {
        const onClick = vi.fn();

        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ExportMenuItem onClick={onClick} />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Export'));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(setActive).toHaveBeenCalledWith({ action: 'export' });
    });

    it('works without onClick callback', async () => {
        render(
            <MockTheme>
                <MockActiveContent setActive={setActive}>
                    <ExportMenuItem />
                </MockActiveContent>
            </MockTheme>
        );

        await user.click(screen.getByText('Export'));

        expect(setActive).toHaveBeenCalledWith({ action: 'export' });
    });
});
