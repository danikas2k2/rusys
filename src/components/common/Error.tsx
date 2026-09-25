import { Alert, Center } from '@mantine/core';
import React from 'react';

import { PageErrorIcon } from '@icons';

import { Label } from '~/components/common/Label';

export type ErrorProps = React.PropsWithChildren<{ size?: string | number; color?: Alert.Props['color'] }>;

export function Error({ children, size = 48, color = 'negative' }: ErrorProps): React.ReactElement {
    return (
        <Center pos="fixed" inset="50% 0">
            <Alert
                variant="filled"
                color={color}
                radius="md"
                title={<Label>Error</Label>}
                icon={<PageErrorIcon size={size} />}
                styles={{ icon: { width: size, height: size } }}
            >
                {children}
            </Alert>
        </Center>
    );
}
