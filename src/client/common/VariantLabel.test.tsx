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

    it('converts liters below 0.1 to milliliters', () => {
        render(
            <MockTheme>
                <VariantLabel count={0.05} units="l" />
            </MockTheme>
        );

        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });

    it('converts kilograms below 0.1 to grams', () => {
        render(
            <MockTheme>
                <VariantLabel count={0.025} units="kg" />
            </MockTheme>
        );

        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('g.')).toBeInTheDocument();
    });

    it('keeps liters as-is when 0.1 or above', () => {
        render(
            <MockTheme>
                <VariantLabel count={0.1} units="l" />
            </MockTheme>
        );

        expect(screen.getByText('0.1')).toBeInTheDocument();
        expect(screen.getByText('l.')).toBeInTheDocument();
    });

    it('keeps non-numeric count unconverted regardless of units', () => {
        render(
            <MockTheme>
                <VariantLabel count="0.05" units="l" />
            </MockTheme>
        );

        expect(screen.getByText('0.05')).toBeInTheDocument();
        expect(screen.getByText('l.')).toBeInTheDocument();
    });
});
