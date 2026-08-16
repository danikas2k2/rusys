import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import React from 'react';

import { VariantAvatar } from '~/client/common/VariantAvatar';
import { useVariant } from '~/client/state/variants/useVariant';

vi.mock(import('~/client/state/variants/useVariant'), () => ({ useVariant: vi.fn() }));

describe('<VariantAvatar>', () => {
    afterEach(() => vi.clearAllMocks());

    it('prefers a configured suffix', () => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: 'd', order: 0, suffix: 'D.' });

        render(
            <MockTheme>
                <VariantAvatar group="Uogienės" variant="d" />
            </MockTheme>
        );

        expect(screen.getByText('D.')).toBeInTheDocument();
    });

    it('formats a volume count to quarter fractions when no suffix is set', () => {
        vi.mocked(useVariant).mockReturnValue({
            group: 'Uogienės',
            variant: 'butelis',
            order: 0,
            count: 1.5,
            units: 'l',
        });

        render(
            <MockTheme>
                <VariantAvatar group="Uogienės" variant="butelis" />
            </MockTheme>
        );

        expect(screen.getByText('1½')).toBeInTheDocument();
    });

    it('uses the variant key when neither suffix nor count is available', () => {
        vi.mocked(useVariant).mockReturnValue(undefined);

        render(
            <MockTheme>
                <VariantAvatar group="Uogienės" variant="d" />
            </MockTheme>
        );

        expect(screen.getByText('d')).toBeInTheDocument();
    });
});
