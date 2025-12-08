import React from 'react';

import { Flex, Loader } from '@mantine/core';

export function ScreenLoader() {
    return (
        <Flex data-loading>
            <Loader size="lg" type="bars" />
        </Flex>
    );
}
