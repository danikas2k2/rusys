import { type Year } from '~/state/types';

export type Years = Year[];

export interface WithYearsState {
    years?: Years;
}
