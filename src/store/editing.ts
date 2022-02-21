import { EditingAction, EditingActionType } from '~/store/editing.actions';
import { Editing } from '~/store/editing.types';

export default function editing(editing: Editing = {}, action: EditingAction): Editing {
    switch (action.type) {
        case EditingActionType.ENABLE:
            return {
                ...editing,
                enabled: true,
                name: action.name,
            };

        case EditingActionType.DISABLE:
            return {
                ...editing,
                enabled: false,
                name: undefined,
            };

        default:
            return editing;
    }
}
