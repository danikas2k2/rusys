import { Flex } from '@mantine/core';
import React from 'react';

import { Error, type ErrorProps } from '~/components/common/Error';

export function ScreenError({ children, ...props }: ErrorProps) {
    return (
        <Flex data-error>
            <Error {...props}>{children}</Error>
        </Flex>
    );
}
