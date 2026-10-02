import { getVariantsFixture } from '@tests/fixtures';

import type { Variant } from '~/common/data';
import { variants as reducer, setVariantsAction } from '~/store/variants/slice';

describe('setVariantsAction', () => {
    it('returns valid action', () => {
        const variants = getVariantsFixture();

        expect(setVariantsAction(variants)).toStrictEqual({ type: setVariantsAction.type, payload: variants });
    });

    it('returns valid action for empty set', () => {
        const variants: Variant[] = [];

        expect(setVariantsAction(variants)).toStrictEqual({ type: setVariantsAction.type, payload: variants });
    });
});

describe('variants', () => {
    const variants = getVariantsFixture();

    describe('default', () => {
        const unknownAction = { type: 'unknown' };

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
            expect(reducer([], setVariantsAction(variants))).toStrictEqual(variants);
        });

        it('update empty state with empty set', () => {
            expect(reducer([], setVariantsAction([]))).toStrictEqual([]);
        });

        it('update filled state', () => {
            expect(reducer(variants.slice(0, 1), setVariantsAction(variants))).toStrictEqual(variants);
        });

        it('update undefined state', () => {
            expect(reducer(undefined, setVariantsAction(variants))).toStrictEqual(variants);
        });
    });
});
