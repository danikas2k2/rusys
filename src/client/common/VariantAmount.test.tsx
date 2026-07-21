import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantAmount } from '~/client/common/VariantAmount';
import { useVariant } from '~/client/state/variants/useVariant';

vi.mock(import('~/client/state/variants/useVariant'), () => ({
    useVariant: vi.fn(),
}));

describe('<VariantAmount>', () => {
    afterEach(() => vi.clearAllMocks());

    it('returns null when useVariant returns undefined', () => {
        vi.mocked(useVariant).mockReturnValue(undefined);

        const { container } = render(
            <MockTheme>
                <VariantAmount group="Uogienės" variant="d" />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('returns null when variant has no count', () => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: 'd', order: 0 });

        const { container } = render(
            <MockTheme>
                <VariantAmount group="Uogienės" variant="d" />
            </MockTheme>
        );

        expect(container).toBeEmptyDOMElement();
    });

    it('renders VariantLabel with count and units when variant has count', () => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: '500ml', order: 0, count: 500, units: 'ml' });

        render(
            <MockTheme>
                <VariantAmount group="Uogienės" variant="500ml" />
            </MockTheme>
        );

        expect(screen.getByText('500')).toBeInTheDocument();
        expect(screen.getByText('ml.')).toBeInTheDocument();
    });
});
