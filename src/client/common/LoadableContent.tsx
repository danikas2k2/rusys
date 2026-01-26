import { Alert, Center, Flex } from '@mantine/core';
import { IconAlertOctagon, IconAlertTriangle } from '@tabler/icons-react';
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
        const size = 48;
        return (
            <Flex data-error>
                <Center pos="fixed" inset={0}>
                    <Alert
                        variant="filled"
                        color="blue"
                        radius="md"
                        title={<Label>Warning</Label>}
                        icon={<IconAlertTriangle size={size} />}
                        styles={{ icon: { width: size, height: size } }}
                    >
                        <Label>No data</Label>
                    </Alert>
                </Center>
            </Flex>
        );
        // return (
        //     <ScreenError>
        //         <Label>No data</Label>
        //     </ScreenError>
        // );
    }

    return <>{children}</>;
}
