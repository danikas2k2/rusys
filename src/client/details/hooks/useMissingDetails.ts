import { useMemo } from 'react';
import { type Details } from '~/common/types';

export function useMissingDetails(details: ReadonlyArray<Details>): typeof details {
    return useMemo(() => details.filter((v) => v.missing), [details]);
}
