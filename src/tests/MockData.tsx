import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

import { IdentityProvider } from '~/components/app/IdentityContext';
import type { InitialAppData } from '~/components/app/initialData';
import { setCatalogData } from '~/store/catalog';
import type { Profile } from '~/store/profile/types';

export function MockData<S>({
    state,
    children,
}: React.PropsWithChildren<{
    state?: S;
}>): React.ReactElement {
    const initial = state as (InitialAppData & { profile?: Profile; google?: { clientId?: string } }) | undefined;
    const [client] = useState(() => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        if (initial) {
            setCatalogData(queryClient, initial);
        }
        return queryClient;
    });
    useEffect(() => {
        if (initial) {
            setCatalogData(client, initial);
        }
    }, [client, initial]);
    return (
        <QueryClientProvider client={client}>
            <IdentityProvider clientId={initial?.google?.clientId} initialProfile={initial?.profile}>
                {children}
            </IdentityProvider>
        </QueryClientProvider>
    );
}
