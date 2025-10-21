import { render, screen } from '@testing-library/react';
import { MockActiveRow } from '@tests/MockActiveRow';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { ActiveGroupBox } from '~/client/pages/groups/ActiveGroupBox';

describe('<ActiveGroupBox>', () => {
    it('does not render box if not active', () => {
        render(
            <MockRedux>
                <MockActiveRow>
                    <ActiveGroupBox />
                </MockActiveRow>
            </MockRedux>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders box if active', () => {
        render(
            <MockRedux>
                <MockActiveRow state={{ editing: true, group: 'Uogienės' }}>
                    <ActiveGroupBox />
                </MockActiveRow>
            </MockRedux>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Uogienės')).toBeInTheDocument();
    });
});
