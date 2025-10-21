import { render, screen } from '@testing-library/react';

import React from 'react';

import { ChangeBadge } from '~/client/common/ChangeBadge';

describe('<ChangeBadge>', () => {
    it('displays positive status when change is greater than zero', async () => {
        render(<ChangeBadge change={1} />);

        expect(screen.getByRole('status')).toHaveTextContent('1').toHaveClass('positive');
    });

    it('displays negative status when change is less than zero', async () => {
        render(<ChangeBadge change={-1} />);

        expect(screen.getByRole('status')).toHaveTextContent('1').toHaveClass('negative');
    });

    it('does not display status when change is zero', async () => {
        render(<ChangeBadge change={0} />);

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('displays neutral status when change is true', async () => {
        render(<ChangeBadge change={true} />);

        expect(screen.getByRole('status')).toHaveTextContent('﹡').not.toHaveClass('positive', 'negative');
    });

    it('renders with top position by default', async () => {
        render(<ChangeBadge change={1} />);

        expect(screen.getByRole('status')).toHaveClass('position-top');
    });

    it('renders with left position', async () => {
        render(<ChangeBadge change={1} position="left" />);

        expect(screen.getByRole('status')).toHaveClass('position-left');
    });

    it('renders with right position', async () => {
        render(<ChangeBadge change={1} position="right" />);

        expect(screen.getByRole('status')).toHaveClass('position-right');
    });
});
