import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantTitle } from '~/components/amounts/VariantTitle';
import { useVariant } from '~/store/variants/useVariant';

vi.mock(import('~/store/variants/useVariant'), () => ({
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

    it('renders the dimmed count/units sub-text as a span, not a <p> - callers often nest this inside their own <Text>', () => {
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

        expect(screen.getByText('500').closest('span')).toBeInTheDocument();
        expect(screen.queryByText('500')?.closest('p')).not.toBeInTheDocument();
    });

    it('renders the dimmed count/units sub-text on its own line below the name', () => {
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

        // A plain inline <span> would sit on the same line as the name - display: block puts it
        // on its own line below, same as the <p> this replaced (see the test above) used to.
        expect(screen.getByText('500').closest('span')).toHaveStyle({ display: 'block' });
    });

    it('falls back to default units when checking for an auto-derived key with no units set', () => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: 'Stiklainis', order: 0, count: 3 });

        render(
            <MockTheme>
                <VariantTitle group="Uogienės" variant="Stiklainis" />
            </MockTheme>
        );

        // Not auto-derived (key would've been "3vnt"), so shows the custom name plus dimmed count
        expect(screen.getByText('Stiklainis')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
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
