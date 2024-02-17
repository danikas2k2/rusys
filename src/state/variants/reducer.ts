import { cloneDeep } from 'lodash';
import { type Variant } from '~/common/types';
import { GroupsActionType } from '~/state/groups/actions';
import { type VariantsAction, VariantsActionType } from '~/state/variants/actions';

export function variants(variants: ReadonlyArray<Variant> = [], action: VariantsAction): ReadonlyArray<Variant> {
    switch (action.type) {
        case VariantsActionType.SET:
            return cloneDeep(action.variants);

        case VariantsActionType.UPDATE:
            return updateVariants(variants, action);

        case VariantsActionType.RENAME:
            return action.variant === action.newVariant ||
                variants.some((d) => d.group === action.group && d.variant === action.newVariant)
                ? variants
                : variants.map((d) =>
                      d.group !== action.group || d.variant !== action.variant
                          ? d
                          : { ...d, variant: action.newVariant }
                  );

        case GroupsActionType.RENAME:
            return action.group === action.newGroup || variants.some((d) => d.group === action.newGroup)
                ? variants
                : variants.map((d) => (d.group !== action.group ? d : { ...d, group: action.newGroup }));

        case VariantsActionType.DELETE:
            return variants.filter((d) => d.group !== action.group || d.variant !== action.variant);

        case GroupsActionType.DELETE:
            return variants.filter((d) => d.group !== action.group);

        default:
            return variants;
    }
}

function updateVariants(
    variants: ReadonlyArray<Variant>,
    { type: _type, ...update }: Extract<VariantsAction, { type: VariantsActionType.UPDATE }>
): ReadonlyArray<Variant> {
    return variants.some((d) => d.group === update.group && d.variant === update.variant)
        ? variants.map((d) =>
              d.group !== update.group || d.variant !== update.variant
                  ? d
                  : { ...update, order: update.order ?? d.order }
          )
        : [
              ...variants,
              {
                  ...update,
                  order:
                      update.order ??
                      variants.reduce((max, v) => (v.group === update.group ? Math.max(max, v.order) : max), -1) + 1,
              },
          ];
}
