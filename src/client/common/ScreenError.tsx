import React from 'react';

import { Flex } from '@mantine/core';

import { Error } from '~/client/common/Error';

export function ScreenError({ children }: React.PropsWithChildren) {
    return (
        <Flex data-error>
            <Error>{children}</Error>
        </Flex>
    );
}
