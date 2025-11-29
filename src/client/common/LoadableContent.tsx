import React from 'react';

import { Flex, Loader } from '@mantine/core';

import { Error } from '~/client/common/Error';
import { Label } from '~/client/common/Label';
import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';

import './LoadableContent.pcss';

interface LoadableContentProps {
    loader: () => Promise<unknown>;
    hasData: boolean;
}

export function LoadableContent({ loader, hasData, children }: React.PropsWithChildren<LoadableContentProps>) {
    const loading = useLockingLoader(loader);

    if (loading === LoadingState.INITIAL || loading === LoadingState.LOADING) {
        return (
            <Flex data-loading>
                <Loader size="lg" type="bars" />
            </Flex>
        );
    }

    if (loading === LoadingState.FAILED) {
        return (
            <Flex data-loading={false} data-error>
                <Error>
                    <Label>Failed to load data</Label>
                </Error>
            </Flex>
        );
    }

    if (!hasData) {
        return (
            <Flex data-loading={false} data-error>
                <Error>
                    <Label>No data</Label>
                </Error>
            </Flex>
        );
    }

    return <>{children}</>;
}
