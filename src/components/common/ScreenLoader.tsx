import { Flex, Loader } from '@mantine/core';
import React from 'react';

export function ScreenLoader() {
    return (
        <Flex data-loading>
            <Loader size="lg" type="bars" />
        </Flex>
    );
}
