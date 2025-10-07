import { useCallback } from 'react';

import { getErrorMessage } from '~/client/app/utils/errors';

export function useErrorWrapper(
    cb: () => void,
    // eslint-disable-next-line no-console
    onError: (e: unknown) => void = (e) => console.error(getErrorMessage(e))
) {
    return useCallback(async () => {
        try {
            return cb();
        } catch (e) {
            return onError(e);
        }
    }, [cb, onError]);
}
