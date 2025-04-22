import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValueChange } from '~/client/details/dialogs/ValueChange';

describe('<ValueChange>', () => {
    it('displays positive status when change is greater than zero', async () => {
        render(<ValueChange change={1} />);

        expect(screen.getByRole('status')).toHaveTextContent('1').toHaveClass('positive');
    });

    it('displays negative status when change is less than zero', async () => {
        render(<ValueChange change={-1} />);

        expect(screen.getByRole('status')).toHaveTextContent('1').toHaveClass('negative');
    });

    it('does not display status when change is zero', async () => {
        render(<ValueChange change={0} />);

        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('displays neutral status when change is true', async () => {
        render(<ValueChange change={true} />);

        expect(screen.getByRole('status')).toHaveTextContent('﹡').not.toHaveClass('positive', 'negative');
    });

    it('renders with top position by default', async () => {
        render(<ValueChange change={1} />);

        expect(screen.getByRole('status')).toHaveClass('position-top');
    });

    it('renders with left position', async () => {
        render(<ValueChange change={1} position="left" />);

        expect(screen.getByRole('status')).toHaveClass('position-left');
    });

    it('renders with right position', async () => {
        render(<ValueChange change={1} position="right" />);

        expect(screen.getByRole('status')).toHaveClass('position-right');
    });
});
