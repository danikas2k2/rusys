import React from 'react';

import { Label } from '~/client/common/Label';
import { ScreenError } from '~/client/common/ScreenError';
import { ScreenLoader } from '~/client/common/ScreenLoader';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';

import './LoadableContent.pcss';

interface LoadableContentProps {
    loader: () => Promise<unknown>;
    hasData: boolean;
}

export function LoadableContent({ loader, hasData, children }: React.PropsWithChildren<LoadableContentProps>) {
    const loading = useLockingLoader(loader);

    if (loading === LoadingState.INITIAL || loading === LoadingState.LOADING) {
        return <ScreenLoader />;
    }

    if (loading === LoadingState.FAILED) {
        return (
            <ScreenError>
                <Label>Failed to load data</Label>
            </ScreenError>
        );
    }

    if (!hasData) {
        return (
            <ScreenError>
                <Label>No data</Label>
            </ScreenError>
        );
    }

    return <>{children}</>;
}
