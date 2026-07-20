import { getChangedAmount, getVariantAmount } from '~/common/utils/amounts';

vi.mock(import('~/client/state/groups/useGetGroups'));
vi.mock(import('~/client/state/variants/useGetVariants'));
vi.mock(import('~/client/state/products/useGetProducts'));

describe('amounts', () => {
    beforeEach(() => {});

    afterEach(() => vi.clearAllMocks());

    describe('getVariantAmount', () => {
        it('returns 0 if variant is not found', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 1 }], 'd')).toBe(0);
        });

        it('returns the amount if found', () => {
            expect(getVariantAmount([{ variant: 'p', amount: 1 }], 'p')).toBe(1);
        });
    });

    describe('getChangedAmount', () => {
        it('returns false if no amounts', () => {
            expect(getChangedAmount([])).toBe(false);
        });

        it('returns the sum of all amounts', () => {
            expect(
                getChangedAmount([
                    { variant: 'p', amount: 1 },
                    { variant: 'd', amount: 2 },
                ])
            ).toBe(3);
        });

        it('returns true if sum of all amounts is zero', () => {
            expect(
                getChangedAmount([
                    { variant: 'p', amount: 1 },
                    { variant: 'd', amount: -1 },
                ])
            ).toBe(true);
        });
    });
});
