import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { ChangeBadge } from '~/client/common/ChangeBadge';

describe('<ChangeBadge>', () => {
    it('displays positive status when change is greater than zero', async () => {
        render(
            <MockTheme>
                <ChangeBadge change={1} />
            </MockTheme>
        );

        expect(screen.getByRole('status')).toHaveTextContent('+1').toHaveAttribute('data-state', 'positive');
    });

    it('displays negative status when change is less than zero', async () => {
        render(
            <MockTheme>
                <ChangeBadge change={-1} />
            </MockTheme>
        );

        expect(screen.getByRole('status')).toHaveTextContent('–1').toHaveAttribute('data-state', 'negative');
    });

    it('does not display status when change is zero', async () => {
        render(
            <MockTheme>
                <ChangeBadge change={0} />
            </MockTheme>
        );

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('displays neutral status when change is true', async () => {
        render(
            <MockTheme>
                <ChangeBadge change />
            </MockTheme>
        );

        expect(screen.getByRole('status')).toHaveTextContent('﹡').toHaveAttribute('data-state', 'updated');
    });

    it('renders with inline position by default', async () => {
        render(
            <MockTheme>
                <ChangeBadge change={1} />
            </MockTheme>
        );

        expect(screen.getByRole('status')).toHaveAttribute('data-position', 'inline');
    });

    it('renders with left position', async () => {
        render(
            <MockTheme>
                <ChangeBadge change={1} position="left" />
            </MockTheme>
        );

        expect(screen.getByRole('status')).toHaveAttribute('data-position', 'left');
    });

    it('renders with right position', async () => {
        render(
            <MockTheme>
                <ChangeBadge change={1} position="right" />
            </MockTheme>
        );

        expect(screen.getByRole('status')).toHaveAttribute('data-position', 'right');
    });

    it('does not display status when change is false', () => {
        render(
            <MockTheme>
                <ChangeBadge change={false} />
            </MockTheme>
        );

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('calculates state when change is false', () => {
        const { rerender } = render(
            <MockTheme>
                <ChangeBadge change={1} />
            </MockTheme>
        );

        expect(screen.getByRole('status')).toBeInTheDocument();

        rerender(
            <MockTheme>
                <ChangeBadge change={false} />
            </MockTheme>
        );

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
});
