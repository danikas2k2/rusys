import { cloneDeep } from 'lodash';
import { type Details } from '~/common/types';
import { type DetailsAction, DetailsActionType } from '~/state/details/actions';
import { GroupsActionType } from '~/state/groups/actions';
import { VariantsActionType } from '~/state/variants/actions';

export function details(details: ReadonlyArray<Details> = [], action: Readonly<DetailsAction>): ReadonlyArray<Details> {
    switch (action.type) {
        case DetailsActionType.SET:
            return cloneDeep(action.details);

        case DetailsActionType.SET_YEARS:
            return details.some((d) => d.group === action.group && d.name === action.name)
                ? details.map((d) =>
                      d.group !== action.group || d.name !== action.name
                          ? d
                          : { ...d, years: action.years?.length ? action.years : undefined }
                  )
                : [
                      ...details,
                      {
                          group: action.group,
                          name: action.name,
                          years: action.years?.length ? action.years : undefined,
                      },
                  ];

        case DetailsActionType.SET_AMOUNTS:
            return details.some((d) => d.group === action.group && d.name === action.name)
                ? details.map((d) =>
                      d.group !== action.group || d.name !== action.name
                          ? d
                          : {
                                ...d,
                                years: action.year
                                    ? action.amounts
                                        ? d.years?.some((y) => y.year === action.year)
                                            ? d.years.map((y) =>
                                                  y.year !== action.year ? y : { ...y, amounts: action.amounts! }
                                              )
                                            : [...(d.years ?? []), { year: action.year, amounts: action.amounts }]
                                        : d.years?.filter((y) => y.year !== action.year)
                                    : undefined,
                            }
                  )
                : [
                      ...details,
                      {
                          group: action.group,
                          name: action.name,
                          years:
                              action.year && action.amounts
                                  ? [{ year: action.year, amounts: action.amounts }]
                                  : undefined,
                      },
                  ];

        case DetailsActionType.SET_MISSING:
            return details.map((d) =>
                d.group !== action.group || d.name !== action.name ? d : { ...d, missing: action.missing || undefined }
            );

        case DetailsActionType.SET_REMOVING:
            return details.map((d) =>
                d.group !== action.group || d.name !== action.name
                    ? d
                    : {
                          ...d,
                          years: d.years?.map((y) =>
                              y.year !== action.year ? y : { ...y, removing: action.removing || undefined }
                          ),
                      }
            );

        case DetailsActionType.MOVE:
            return action.group === action.newGroup ||
                details.some((d) => d.group === action.newGroup && d.name === action.name)
                ? details
                : details.map((d) =>
                      d.group !== action.group || d.name !== action.name ? d : { ...d, group: action.newGroup }
                  );

        case DetailsActionType.RENAME:
            return action.name === action.newName ||
                details.some((d) => d.group === action.group && d.name === action.newName)
                ? details
                : details.map((d) =>
                      d.group !== action.group || d.name !== action.name ? d : { ...d, name: action.newName }
                  );

        case GroupsActionType.RENAME:
            return action.group === action.newGroup || details.some((d) => d.group === action.newGroup)
                ? details
                : details.map((d) => (d.group !== action.group ? d : { ...d, group: action.newGroup }));

        case VariantsActionType.RENAME:
            return action.variant === action.newVariant
                ? details
                : details.map((d) =>
                      d.group !== action.group
                          ? d
                          : {
                                ...d,
                                years: d.years?.map((y) => ({
                                    ...y,
                                    amounts: y.amounts.map((v) =>
                                        v.variant !== action.variant ? v : { ...v, variant: action.newVariant }
                                    ),
                                })),
                            }
                  );

        case DetailsActionType.DELETE:
            return details.filter((d) => d.group !== action.group || d.name !== action.name);

        case GroupsActionType.DELETE:
            return details.filter((d) => d.group !== action.group);

        case VariantsActionType.DELETE:
            return details.map((d) =>
                d.group !== action.group
                    ? d
                    : {
                          ...d,
                          years: d.years?.map((y) => ({
                              ...y,
                              amounts: y.amounts.filter((v) => v.variant !== action.variant),
                          })),
                      }
            );

        default:
            return details;
    }
}
