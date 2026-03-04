import { Alert, Center, Flex } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import React from 'react';

import { Label } from '~/client/common/Label';

export function HistoryMissingData(): React.ReactElement {
    const size = 48;

    return (
        <Flex data-error>
            <Center pos="fixed" inset={0}>
                <Alert
                    variant="filled"
                    color="primary"
                    radius="md"
                    title={<Label>Notice</Label>}
                    icon={<IconInfoCircle size={size} />}
                    styles={{ icon: { width: size, height: size } }}
                >
                    <Label>No data</Label>. <Label>Choose another year</Label>.
                </Alert>
            </Center>
        </Flex>
    );
}
