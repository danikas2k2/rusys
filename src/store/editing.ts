import type { EditingAction } from '~/store/editing.actions';
import { EditingActionType } from '~/store/editing.actions';
import type { Editing } from '~/store/editing.types';

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
