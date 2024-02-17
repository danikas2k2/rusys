import { type UpdateVariant, type Variant } from '~/common/types';
import { type GroupsActionType } from '~/state/groups/actions';

export const enum VariantsActionType {
    SET = 'variants.set',
    UPDATE = 'variants.update',
    RENAME = 'variants.rename',
    DELETE = 'variants.delete',
}

export type VariantsAction =
    | {
          type: VariantsActionType.SET;
          variants: Variant[];
      }
    | {
          type: VariantsActionType.UPDATE;
          group: string;
          variant: string;
          order?: number;
          long?: string;
          short?: string;
      }
    | {
          type: VariantsActionType.RENAME;
          group: string;
          variant: string;
          newVariant: string;
      }
    | {
          type: GroupsActionType.RENAME;
          group: string;
          newGroup: string;
      }
    | {
          type: VariantsActionType.DELETE;
          group: string;
          variant: string;
      }
    | {
          type: GroupsActionType.DELETE;
          group: string;
      };

export const setVariantsAction = (variants: Variant[]): VariantsAction => ({
    type: VariantsActionType.SET,
    variants,
});

export function updateVariantAction(group: string, variant: string, update: UpdateVariant): VariantsAction {
    return {
        type: VariantsActionType.UPDATE,
        group,
        variant,
        ...update,
    };
}

export const renameVariantAction = (group: string, variant: string, newVariant: string): VariantsAction => ({
    type: VariantsActionType.RENAME,
    group,
    variant,
    newVariant,
});

export const deleteVariantAction = (group: string, variant: string): VariantsAction => ({
    type: VariantsActionType.DELETE,
    group,
    variant,
});
