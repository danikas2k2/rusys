import type { Variant } from '@rusys/common/data';

export const enum VariantsActionType {
    SET = 'variants.set',
}

export type VariantsAction = {
    type: VariantsActionType.SET;
    variants: Variant[];
};

export const setVariantsAction = (variants: Variant[]): VariantsAction => ({
    type: VariantsActionType.SET,
    variants,
});
