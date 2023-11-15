import { type NameWithGroup } from '~/state/details/types';
import { type GroupedSet, type Year } from '~/state/types';

export type Removing = Record<Year, boolean>;
export type RemovingSet = GroupedSet<Removing>;
export type NamedRemoving = NameWithGroup & Removing;

export interface WithRemovingState {
    removing?: RemovingSet;
}
