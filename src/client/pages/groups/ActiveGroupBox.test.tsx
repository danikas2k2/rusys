import { render, screen } from '@testing-library/react';
import { MockActiveContent } from '@tests/MockActiveContent';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { ActiveGroupBox } from '~/client/pages/groups/ActiveGroupBox';

describe('<ActiveGroupBox>', () => {
    it('does not render box if not active', () => {
        render(
            <MockRedux>
                <MockActiveContent>
                    <ActiveGroupBox />
                </MockActiveContent>
            </MockRedux>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <MockRedux>
                <MockActiveContent state={{ editing: true, group: 'Uogienės' }}>
                    <ActiveGroupBox />
                </MockActiveContent>
            </MockRedux>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Uogienės')).toBeInTheDocument();
    });
});
