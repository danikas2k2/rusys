import type { ErrorState } from '~/store/error/reducer';

export interface WithErrorState {
    error?: ErrorState;
}
