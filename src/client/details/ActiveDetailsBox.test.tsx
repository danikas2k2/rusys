import React from 'react';
import { render, screen } from '@testing-library/react';
import { getGroupsFixture } from '@tests/fixtures';
import { MockActiveRow } from '@tests/MockActiveRow';
import { MockRedux } from '@tests/MockRedux';
import { ActiveDetailsBox } from '~/client/details/ActiveDetailsBox';

describe('<ActiveDetailsBox>', () => {
    it('does not render box if not active', () => {
        render(
            <MockRedux>
                <MockActiveRow>
                    <ActiveDetailsBox />
                </MockActiveRow>
            </MockRedux>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <MockRedux state={{ groups: getGroupsFixture() }}>
                <MockActiveRow state={{ editing: true, group: 'Uogienės', name: 'Avietės' }}>
                    <ActiveDetailsBox />
                </MockActiveRow>
            </MockRedux>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Uogienės')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Avietės')).toBeInTheDocument();
    });
});
