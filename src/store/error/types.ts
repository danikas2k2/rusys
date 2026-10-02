import type { ErrorState } from '~/store/error/slice';

export interface WithErrorState {
    error?: ErrorState;
}
