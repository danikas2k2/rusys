import { Alert, Center } from '@mantine/core';
import { IconAlertOctagon } from '@tabler/icons-react';
import React from 'react';

import { Label } from '~/client/common/Label';

export function Error({
    children,
    size = 48,
}: React.PropsWithChildren<{ size?: string | number }>): React.ReactElement {
    return (
        <Center pos="fixed" inset={0}>
            <Alert
                variant="filled"
                color="negative"
                radius="md"
                title={<Label>Error</Label>}
                icon={<IconAlertOctagon size={size} />}
                styles={{ icon: { width: size, height: size } }}
            >
                {children}
            </Alert>
        </Center>
    );
}
