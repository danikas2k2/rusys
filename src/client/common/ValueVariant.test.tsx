import React from 'react';
import { render, screen } from '@testing-library/react';
import { getVariantsFixture } from '@tests/fixtures';
import { MockRedux } from '@tests/MockRedux';
import { ValueVariant } from '~/client/common/ValueVariant';

describe('<ValueVariant>', () => {
    const state = { variants: getVariantsFixture() };

    it('renders variant suffix by default', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="d" />
            </MockRedux>
        );

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders variant suffix if true passed', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="d" suffix />
            </MockRedux>
        );

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('renders full variant if false passed', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="d" suffix={false} />
            </MockRedux>
        );

        expect(screen.getByText('d')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="unknown" />
            </MockRedux>
        );

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });

    it('renders variant as is when no format is found and full variant requested', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="unknown" suffix={false} />
            </MockRedux>
        );

        expect(screen.getByText('unknown')).toBeInTheDocument();
    });

    it('renders suffix as a single string', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="500 ml" suffix />
            </MockRedux>
        );

        expect(screen.getByText('500 ml')).toBeInTheDocument();
    });

    it('renders full variant parts', () => {
        render(
            <MockRedux state={state}>
                <ValueVariant group="Uogienės" variant="500 ml" suffix={false} />
            </MockRedux>
        );

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml')).toBeInTheDocument();
    });
});
