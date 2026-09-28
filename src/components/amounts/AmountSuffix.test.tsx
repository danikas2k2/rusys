import { render, screen } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { AmountSuffix } from '~/components/amounts/AmountSuffix';

describe('<AmountSuffix>', () => {
    const state = { variants: getVariantsFixture() };

    it('renders suffix by default', () => {
        render(
            <MockRedux state={state}>
                <AmountSuffix group="Uogienės" variant="d" />
            </MockRedux>
        );

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders variant as is when not found', () => {
        render(
            <MockRedux state={state}>
                <AmountSuffix group="Uogienės" variant="unknown" />
            </MockRedux>
        );

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });

    it('renders no suffix when count/units are set but no manual suffix was given (e.g. the default-size variant in a group)', () => {
        const { container } = render(
            <MockRedux
                state={{ variants: [{ group: 'Uogienės', variant: '500ml', order: 0, count: 500, units: 'ml' }] }}
            >
                <AmountSuffix group="Uogienės" variant="500ml" />
            </MockRedux>
        );

        expect(container.querySelector('sub')).toBeNull();
    });
});
