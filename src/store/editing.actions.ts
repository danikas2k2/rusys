import { Name } from '~/store/details.types';

export enum EditingActionType {
    ENABLE = 'editing.enable',
    DISABLE = 'editing.disable',
}

export type EditingAction = {
    type: EditingActionType.ENABLE;
    name: Name;
} | {
    type: EditingActionType.DISABLE;
};

export const enableEditingAction = (name: Name): EditingAction => ({
    type: EditingActionType.ENABLE,
    name,
});

export const disableEditingAction = (): EditingAction => ({
    type: EditingActionType.DISABLE,
});
