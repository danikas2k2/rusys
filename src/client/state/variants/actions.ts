import { type Variant } from '~/types/data';

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
