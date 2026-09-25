import { Avatar, type AvatarProps } from '@mantine/core';
import React from 'react';

export interface ProductAvatarProps extends Pick<AvatarProps, 'size'> {
    image?: string;
    label: string;
}

export function ProductAvatar({ image, label, size = 'xs' }: ProductAvatarProps): React.ReactElement {
    return (
        <Avatar src={image || undefined} radius="sm" size={size} p={0} aria-hidden="true">
            {label.trim().charAt(0).toUpperCase()}
        </Avatar>
    );
}
