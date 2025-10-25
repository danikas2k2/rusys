import React, { type JSX, type PropsWithChildren } from 'react';

import { Alert, Center } from '@mantine/core';
import { IconAlertOctagon } from '@tabler/icons-react';

import { useLabel } from './hooks/useLabel';

export function Error({ children }: PropsWithChildren): JSX.Element {
    return (
        <Center pos="fixed" inset={0}>
            <Alert variant="filled" color="red" radius="md" title={useLabel('Error')} icon={<IconAlertOctagon />}>
                {children}
            </Alert>
        </Center>
    );
}
