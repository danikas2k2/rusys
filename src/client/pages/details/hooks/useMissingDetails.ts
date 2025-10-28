import { useMemo } from 'react';

import type { Details } from '~/types/data';

export function useMissingDetails(details: readonly Details[]): typeof details {
    return useMemo(() => details.filter((v) => v.missing), [details]);
}
