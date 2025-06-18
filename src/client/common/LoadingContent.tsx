import React, { type PropsWithChildren } from 'react';
import { Loader } from '@ui/Loader';
import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { Label } from '~/client/common/Label';
import { Error } from '~/client/Error';
import cx from './LoadingContent.pcss';

interface LoadingTableProps {
    loader: () => Promise<unknown>;
    hasData: boolean;
}

export function LoadingContent({ loader, hasData, children }: PropsWithChildren<LoadingTableProps>) {
    const loading = useLockingLoader(loader);
    if (loading === LoadingState.INITIAL || loading === LoadingState.LOADING) {
        return (
            <div>
                <Loader />
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
