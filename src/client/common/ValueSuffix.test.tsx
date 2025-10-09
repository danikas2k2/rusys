import { render, screen } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';

import { ValueSuffix } from '~/client/common/ValueSuffix';

describe('<ValueSuffix>', () => {
    const state = { variants: getVariantsFixture() };

    it('renders suffix by default', () => {
        render(
            <MockRedux state={state}>
                <ValueSuffix group="Uogienės" variant="d" />
            </MockRedux>
        );

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders variant as is when not found', () => {
        render(
            <MockRedux state={state}>
                <ValueSuffix group="Uogienės" variant="unknown" />
            </MockRedux>
        );

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });
});
