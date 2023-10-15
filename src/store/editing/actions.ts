import { type Name } from '~/store/types';

export const enum EditingActionType {
    ENABLE = 'editing.enable',
    DISABLE = 'editing.disable',
}

export type EditingAction =
    | {
          type: EditingActionType.ENABLE;
          name: Name;
      }
    | {
          type: EditingActionType.DISABLE;
      };

export const enableEditingAction = (name: Name): EditingAction => ({
    type: EditingActionType.ENABLE,
    name,
});

export const disableEditingAction = (): EditingAction => ({
    type: EditingActionType.DISABLE,
});
