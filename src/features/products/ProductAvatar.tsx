import type { AvatarProps } from '@mantine/core';
import React from 'react';

import { Thumbnail } from '~/components/common/Thumbnail';

export interface ProductAvatarProps extends Pick<AvatarProps, 'size'> {
    image?: string;
    label: string;
}

export function ProductAvatar({ image, label, size = 'xs' }: ProductAvatarProps): React.ReactElement {
    return (
        <Thumbnail
            src={image}
            alt=""
            fallback={label.trim().charAt(0).toUpperCase()}
            radius="sm"
            size={size}
            p={0}
            aria-hidden="true"
        />
    );
}
