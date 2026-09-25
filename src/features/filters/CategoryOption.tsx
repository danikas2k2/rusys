import { Group, type ComboboxItem } from '@mantine/core';
import React from 'react';

import { CategoryAvatar } from '~/features/filters/CategoryAvatar';

export interface CategoryOptionProps {
    option: ComboboxItem;
    image?: string;
}

export function CategoryOption({ option, image }: CategoryOptionProps): React.ReactElement {
    return (
        <Group gap="xs" wrap="nowrap">
            <CategoryAvatar image={image} label={option.label} />
            {option.label}
        </Group>
    );
}
