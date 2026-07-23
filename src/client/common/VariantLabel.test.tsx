import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantLabel } from '~/client/common/VariantLabel';

describe('<VariantLabel>', () => {
    it('renders count and appends dot when units does not end with dot', () => {
        render(
            <MockTheme>
                <VariantLabel count={500} units="ml" />
            </MockTheme>
        );

        expect(screen.getByText('500')).toBeInTheDocument();
        // RTL joins direct text nodes of <small>: " " + "ml" + "." → "ml." after normalisation
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });

    it('renders count without extra dot when units already ends with dot', () => {
        render(
            <MockTheme>
                <VariantLabel count={500} units="ml." />
            </MockTheme>
        );

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
        // component must not append a second dot
        expect(screen.queryByText('ml..')).not.toBeInTheDocument();
    });

    it('renders default units "vnt" when units prop is not provided', () => {
        render(
            <MockTheme>
                <VariantLabel count={10} />
            </MockTheme>
        );

        expect(screen.getByText('10')).toBeInTheDocument();
        expect(screen.getByText('vnt.')).toBeInTheDocument();
    });

    it('returns null when count is 0', () => {
        const { container } = render(
            <MockTheme>
                <VariantLabel count={0} />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('returns null when count is empty string', () => {
        const { container } = render(
            <MockTheme>
                <VariantLabel count="" />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });
});
