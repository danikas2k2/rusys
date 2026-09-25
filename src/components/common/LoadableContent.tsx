import React, { Suspense, use } from 'react';

import { Label } from '~/components/common/Label';
import { ScreenError } from '~/components/common/ScreenError';
import { ScreenLoader } from '~/components/common/ScreenLoader';
import { ErrorBoundary } from '~/components/runtime/ErrorBoundary';
import { useClearSuspenseResource, useSuspenseResource } from '~/components/runtime/RefreshContext';

interface LoadableContentProps {
    resourceKey: string;
    loader: () => Promise<void>;
    hasData: boolean;
    fallback?: React.ReactNode;
}

function LoadedContent({ resourceKey, loader, hasData, children }: React.PropsWithChildren<LoadableContentProps>) {
    use(useSuspenseResource(resourceKey, loader));

    if (!hasData) {
        return (
            <ScreenError>
                <Label>No data</Label>
            </ScreenError>
        );
    }

    return <>{children}</>;
}

export function LoadableContent({
    resourceKey,
    loader,
    hasData,
    fallback = <ScreenLoader />,
    children,
}: React.PropsWithChildren<LoadableContentProps>) {
    const clear = useClearSuspenseResource(resourceKey);

    return (
        <ErrorBoundary onReload={clear}>
            <Suspense fallback={fallback}>
                <LoadedContent resourceKey={resourceKey} loader={loader} hasData={hasData}>
                    {children}
                </LoadedContent>
            </Suspense>
        </ErrorBoundary>
    );
}
