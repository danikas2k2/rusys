import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantTitle } from '~/client/common/VariantTitle';
import { useVariant } from '~/client/state/variants/useVariant';

vi.mock(import('~/client/state/variants/useVariant'), () => ({
    useVariant: vi.fn(),
}));

describe('<VariantTitle>', () => {
    afterEach(() => vi.clearAllMocks());

    it('renders variant key as-is when useVariant returns undefined (fallback to variant prop)', () => {
        vi.mocked(useVariant).mockReturnValue(undefined);

        render(
            <MockTheme>
                <VariantTitle group="Uogienės" variant="d" />
            </MockTheme>
        );

        expect(screen.getByText('d')).toBeInTheDocument();
    });

    it('renders variant.variant when no name and no count', () => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: 'd', order: 0 });

        render(
            <MockTheme>
                <VariantTitle group="Uogienės" variant="d" />
            </MockTheme>
        );

        expect(screen.getByText('d')).toBeInTheDocument();
    });

    it('renders VariantLabel with count and units when no name but has count', () => {
        vi.mocked(useVariant).mockReturnValue({
            group: 'Uogienės',
            variant: '500ml',
            order: 0,
            count: 500,
            units: 'ml',
        });

        render(
            <MockTheme>
                <VariantTitle group="Uogienės" variant="500ml" />
            </MockTheme>
        );

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });

    it('renders the custom variant key directly when no count is set', () => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: 'Didelė', order: 0 });

        render(
            <MockTheme>
                <VariantTitle group="Uogienės" variant="Didelė" />
            </MockTheme>
        );

        expect(screen.getByText('Didelė')).toBeInTheDocument();
    });

    it('renders the custom variant key with count/units as dimmed sub-text when the key was not auto-derived from them', () => {
        vi.mocked(useVariant).mockReturnValue({
            group: 'Uogienės',
            variant: 'Stiklainis',
            order: 0,
            count: 500,
            units: 'ml',
        });

        render(
            <MockTheme>
                <VariantTitle group="Uogienės" variant="Stiklainis" />
            </MockTheme>
        );

        expect(screen.getByText('Stiklainis')).toBeInTheDocument();
        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });

    it('renders space-split variant key as VariantLabel when no variantData and key contains a space (legacy path)', () => {
        vi.mocked(useVariant).mockReturnValue(undefined);

        render(
            <MockTheme>
                <VariantTitle group="Uogienės" variant="500 ml" />
            </MockTheme>
        );

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });
});
