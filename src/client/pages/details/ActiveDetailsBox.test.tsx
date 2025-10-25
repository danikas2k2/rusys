import { render, screen } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { ActiveDetailsBox } from '~/client/pages/details/ActiveDetailsBox';

describe('<ActiveDetailsBox>', () => {
    it('does not render box if not active', () => {
        render(
            <MockRedux>
                <MockActiveContent>
                    <ActiveDetailsBox />
                </MockActiveContent>
            </MockRedux>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <MockRedux state={{ groups: getGroupsFixture() }}>
                <MockActiveContent state={{ editing: true, group: 'Uogienės', name: 'Avietės' }}>
                    <ActiveDetailsBox />
                </MockActiveContent>
            </MockRedux>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Uogienės')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Avietės')).toBeInTheDocument();
    });
});
