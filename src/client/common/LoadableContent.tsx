import React from 'react';

import { Loader } from '@mantine/core';

import { Error } from '~/client/common/Error';
import { Label } from '~/client/common/Label';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import cx from './LoadableContent.pcss';

interface LoadableContentProps {
    loader: () => Promise<unknown>;
    hasData: boolean;
}

export function LoadableContent({ loader, hasData, children }: React.PropsWithChildren<LoadableContentProps>) {
    const loading = useLockingLoader(loader);
    if (loading === LoadingState.INITIAL || loading === LoadingState.LOADING) {
        return (
            <div className={cx('Loader')}>
                <Loader size="lg" type="bars" />
            </div>
        );
    }

    if (loading === LoadingState.FAILED) {
        return (
            <div className={cx('Content')}>
                <Error>
                    <Label>Failed to load data</Label>
                </Error>
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className={cx('Content')}>
                <Error>
                    <Label>No data</Label>
                </Error>
            </div>
        );
    }

    return <>{children}</>;
}
