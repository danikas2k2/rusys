import { type Details } from '~/common/types';
import { DetailsActionType, type DetailsAction } from '~/state/details/actions';
import { cloneDeep } from 'lodash';

export function details(state: ReadonlyArray<Details> = [], action: Readonly<DetailsAction>): ReadonlyArray<Details> {
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
