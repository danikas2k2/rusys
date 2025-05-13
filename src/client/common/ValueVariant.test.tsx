import React from 'react';
import { render, screen } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { ValueVariant } from '~/client/common/ValueVariant';

describe('<ValueVariant>', () => {
    const state = { variants: getVariantsFixture() };

    it('renders short format when format prop is not provided', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="d" />
            </MockRedux>
        );

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders short format when format prop is "short"', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="d" format="short" />
            </MockRedux>
        );

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders long format when format prop is "long"', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="d" format="long" />
            </MockRedux>
        );

        expect(screen.getByText('750')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="unknown" />
            </MockRedux>
        );

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found and format prop is "long"', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="unknown" format="long" />
            </MockRedux>
        );

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });
});
