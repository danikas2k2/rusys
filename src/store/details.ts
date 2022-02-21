import { cloneDeep } from 'lodash';
import { DetailsAction, DetailsActionType } from '~/store/details.actions';
import { Details } from '~/store/details.types';

export default function details(details: Details = {}, action: DetailsAction): Details {
    switch (action.type) {
        case DetailsActionType.ADD:
            return { '': {}, ...details };

        case DetailsActionType.SET:
            return cloneDeep(action.details);

        default:
            return details;
    }
}
