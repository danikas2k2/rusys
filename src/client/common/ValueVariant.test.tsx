import React from 'react';
import { render, screen } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { withReduxState } from '@tests/withReduxState';
import { ValueVariant } from '~/client/common/ValueVariant';

describe('<ValueVariant>', () => {
    const state = { variants: getVariantsFixture() };

    it('renders short format when format prop is not provided', () => {
        render(<ValueVariant group="Uogienės" variant="d" />, withReduxState(state));

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders short format when format prop is "short"', () => {
        render(<ValueVariant group="Uogienės" variant="d" format="short" />, withReduxState(state));

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders long format when format prop is "long"', () => {
        render(<ValueVariant group="Uogienės" variant="d" format="long" />, withReduxState(state));

        expect(screen.getByText('750')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found', () => {
        render(<ValueVariant group="Uogienės" variant="unknown" />, withReduxState(state));

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found and format prop is "long"', () => {
        render(<ValueVariant group="Uogienės" variant="unknown" format="long" />, withReduxState(state));

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });
});
