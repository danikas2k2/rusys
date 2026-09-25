import { render, screen } from '@testing-library/react';
import { MockTheme } from '@tests/MockTheme';

import type { VariantUnits } from '@rusys/common/data';
import React from 'react';

import { VariantAvatar } from '~/components/amounts/VariantAvatar';
import { useVariant } from '~/store/variants/useVariant';

vi.mock(import('~/store/variants/useVariant'), () => ({ useVariant: vi.fn() }));

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

    it.each<[VariantUnits | undefined, number, string]>([
        ['ml', 500, '½'],
        ['kg', 1, '1'],
        ['g', 500, '½'],
        [undefined, 0.25, '¼'],
    ])('formats %s counts without a suffix', (units: VariantUnits | undefined, count: number, label: string) => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: 'v', order: 0, count, units });

        render(
            <MockTheme>
                <VariantAvatar group="Uogienės" variant="v" />
            </MockTheme>
        );

        expect(screen.getByText(label)).toBeInTheDocument();
    });

    it('falls back to the variant key for a zero count', () => {
        vi.mocked(useVariant).mockReturnValue({ group: 'Uogienės', variant: 'v', order: 0, count: 0 });

        render(
            <MockTheme>
                <VariantAvatar group="Uogienės" variant="v" />
            </MockTheme>
        );

        expect(screen.getByText('v')).toBeInTheDocument();
    });
});
