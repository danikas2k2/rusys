import type { ErrorState } from '~/client/state/error/reducer';

export interface WithErrorState {
    error?: ErrorState;
}

