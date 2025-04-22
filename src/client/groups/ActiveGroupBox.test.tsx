import React from 'react';
import { render, screen } from '@testing-library/react';
import { withActiveRowContext } from '@tests/withActiveRowContext';
import { withMany } from '@tests/withMany';
import { withReduxState } from '@tests/withReduxState';
import { ActiveGroupBox } from '~/client/groups/ActiveGroupBox';

describe('<ActiveGroupBox>', () => {
    it('does not render box if not active', () => {
        render(<ActiveGroupBox />, withMany(withActiveRowContext(), withReduxState()));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <ActiveGroupBox />,
            withMany(withActiveRowContext({ editing: true, group: 'Uogienės' }), withReduxState())
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Uogienės')).toBeInTheDocument();
    });
});
