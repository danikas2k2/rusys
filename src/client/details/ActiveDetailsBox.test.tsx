import React from 'react';
import { render, screen } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { withActiveRowContext } from '@tests/withActiveRowContext';
import { withMany } from '@tests/withMany';
import { withReduxState } from '@tests/withReduxState';
import { ActiveDetailsBox } from '~/client/details/ActiveDetailsBox';

describe('<ActiveDetailsBox>', () => {
    it('does not render box if not active', () => {
        render(<ActiveDetailsBox />, withMany(withActiveRowContext(), withReduxState()));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <ActiveDetailsBox />,
            withMany(
                withActiveRowContext({ editing: true, group: 'Uogienės', name: 'Avietės' }),
                withReduxState({ groups: getGroupsFixture() })
            )
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Uogienės')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Avietės')).toBeInTheDocument();
    });
});
