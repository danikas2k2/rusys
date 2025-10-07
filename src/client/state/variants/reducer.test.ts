import { getVariantsFixture } from '@tests/fixtures';

import { VariantsActionType, type VariantsAction } from '~/client/state/variants/actions';
import { variants as reducer } from '~/client/state/variants/reducer';

describe('variants', () => {
    const variants = getVariantsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' as VariantsActionType } as VariantsAction;

        it('leave set unchanged', () => {
            expect(reducer(variants, unknownAction)).toStrictEqual(variants);
        });

        it('leave empty set unchanged', () => {
            expect(reducer([], unknownAction)).toStrictEqual([]);
        });

        it('return default state for undefined', () => {
            expect(reducer(undefined, unknownAction)).toStrictEqual([]);
        });
    });

    describe('set', () => {
        it('update empty state', () => {
            expect(
                reducer([], {
                    type: VariantsActionType.SET,
                    variants,
                })
            ).toStrictEqual(variants);
        });

        it('update empty state with empty set', () => {
            expect(
                reducer([], {
                    type: VariantsActionType.SET,
                    variants: [],
                })
            ).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(
                reducer(variants.slice(0, 1), {
                    type: VariantsActionType.SET,
                    variants,
                })
            ).toStrictEqual(variants);
        });

        it('update undefined state', () => {
            expect(
                reducer(undefined, {
                    type: VariantsActionType.SET,
                    variants,
                })
            ).toStrictEqual(variants);
        });
    });
});
