import { cloneDeep } from 'lodash';

import { DetailsActionType, type DetailsAction } from '~/client/state/details/actions';
import type { Details } from '~/types/data';

export function details(state: readonly Details[] = [], action: Readonly<DetailsAction>): readonly Details[] {
    switch (action.type) {
        case DetailsActionType.SET:
            return cloneDeep(action.details);

        case DetailsActionType.SET_MISSING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name ? d : { ...d, missing: action.missing || undefined }
            );

        case DetailsActionType.SET_REMOVING:
            return state.map((d) =>
                d.group !== action.group || d.name !== action.name
                    ? d
                    : {
                          ...d,
                          years: d.years?.map((y) =>
                              y.year !== action.year ? y : { ...y, removing: action.removing || undefined }
                          ),
                      }
            );

        default:
            return state;
    }
}
