import { cloneDeep, isEmpty } from 'lodash';
import { type DetailsAction, DetailsActionType } from '~/store/details/actions';
import { type Details, type Values } from '~/store/details/types';

export default function details(details: Details = {}, action: DetailsAction): Details {
    switch (action.type) {
        case DetailsActionType.SET:
            return cloneDeep(action.details);

        case DetailsActionType.RENAME: {
            if (action.name === action.newName) {
                return details;
            }
            const { [action.name]: values, ...otherDetails } = details;
            return { [action.newName]: values, ...otherDetails };
        }

        case DetailsActionType.REMOVE: {
            const { [action.name]: _remove, ...otherDetails } = details;
            return otherDetails;
        }

        case DetailsActionType.UPDATE: {
            const values: Values = { ...details[action.name] };
            if (action.year) {
                if (action.value && !isEmpty(action.value)) {
                    values[action.year] = action.value;
                } else {
                    delete values[action.year];
                }
            }
            return { ...details, [action.name]: values };
        }

        default:
            return details;
    }
}
