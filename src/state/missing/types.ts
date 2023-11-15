import { type NameWithGroup } from '~/state/details/types';

export type Missing = NameWithGroup[];

export interface WithMissingState {
    missing?: Missing;
}
