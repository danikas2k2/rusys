import { cloneDeep, isEmpty, merge } from 'lodash';
import { type DetailsAction, DetailsActionType } from '~/state/details/actions';
import { type Amounts, type AmountSet } from '~/state/details/types';

// TODO update reducer to remove empty sets
// TODO extract manipulation functions to utils
export default function details(details: AmountSet = {}, action: DetailsAction): AmountSet {
    switch (action.type) {
        case DetailsActionType.SET:
            return cloneDeep(action.details);

        case DetailsActionType.RENAME: {
            if (action.name === action.newName || !details[action.group]?.[action.name]) {
                return details;
            }
            const {
                [action.group]: { [action.name]: values, ...otherDetails },
                ...otherGroups
            } = details;
            return {
                [action.group]: merge({}, otherDetails, { [action.newName]: values }),
                ...otherGroups,
            };
        }

        case DetailsActionType.RENAME_GROUP: {
            if (action.group === action.newGroup || !details[action.group]) {
                return details;
            }
            const { [action.group]: values, ...otherGroups } = details;
            return merge({}, otherGroups, { [action.newGroup]: values });
        }

        case DetailsActionType.REMOVE: {
            if (!details[action.group]?.[action.name]) {
                return details;
            }
            const {
                [action.group]: { [action.name]: _remove, ...otherDetails },
                ...otherGroups
            } = details;
            return { [action.group]: otherDetails, ...otherGroups };
        }

        case DetailsActionType.REMOVE_GROUP: {
            if (!details[action.group]) {
                return details;
            }
            const { [action.group]: _remove, ...otherGroups } = details;
            return otherGroups;
        }

        case DetailsActionType.MOVE: {
            if (action.group === action.newGroup || !details[action.group]?.[action.name]) {
                return details;
            }
            const {
                [action.group]: { [action.name]: values, ...otherDetails },
                ...otherGroups
            } = details;
            return merge({}, otherGroups, {
                [action.group]: otherDetails,
                [action.newGroup]: { [action.name]: values },
            });
        }

        case DetailsActionType.UPDATE: {
            const values: Amounts = { ...details[action.group]?.[action.name] };
            if (action.year) {
                if (action.value && !isEmpty(action.value)) {
                    values[action.year] = action.value;
                } else {
                    delete values[action.year];
                }
            }
            return {
                ...details,
                [action.group]: {
                    ...details[action.group],
                    [action.name]: values,
                },
            };
        }

        default:
            return details;
    }
}
