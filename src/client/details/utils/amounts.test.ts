import { getChangedAmount, getVariant, getVariantAmount } from '~/client/details/utils/amounts';

jest.mock('~/state/groups/useGetGroups');
jest.mock('~/state/variants/useGetVariants');
jest.mock('~/state/details/useGetDetails');

describe('amounts', () => {
    beforeEach(() => {});

    afterEach(() => jest.clearAllMocks());

    describe('getVariant', () => {
        it('returns undefined if amounts is undefined', () => {
            expect(getVariant(undefined, 'p')).toBeUndefined();
        });

        it('returns undefined if variant is not found', () => {
            expect(getVariant([{ variant: 'p', amount: 1 }], 'd')).toBeUndefined();
        });

        it('returns the variant if found', () => {
            expect(getVariant([{ variant: 'p', amount: 1 }], 'p')).toEqual({ variant: 'p', amount: 1 });
        });
    });

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
            expect(getChangedAmount([])).toBeFalse();
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
            ).toBeTrue();
        });
    });
});
