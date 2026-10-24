import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { IdentityProvider } from '~/components/app/IdentityContext';
import type { InitialAppData } from '~/components/app/initialData';
import { setCatalogData } from '~/store/catalog';
import { ErrorProvider } from '~/store/error/useError';
import type { Profile } from '~/store/profile/types';

export function mockQuery(initial: InitialAppData & { profile?: Profile; google?: { clientId?: string } } = {}) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    setCatalogData(client, initial);
    function wrapper({ children }: React.PropsWithChildren) {
        return (
            <QueryClientProvider client={client}>
                <IdentityProvider clientId={initial.google?.clientId} initialProfile={initial.profile}>
                    <ErrorProvider>{children}</ErrorProvider>
                </IdentityProvider>
            </QueryClientProvider>
        );
    }
    return { client, wrapper };
}
