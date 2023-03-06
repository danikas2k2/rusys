import type { ButtonProps } from '@ui/Button';
import Button from '@ui/Button';
import useForwardedRef from '@ui/hooks/useForwardedRef';
import type { ForwardedRef } from 'react';
import React, { forwardRef, memo } from 'react';

export default memo(
    forwardRef(function IconButton(
        { size = 'large', variant = 'plain', spacing = 'none', ...props }: ButtonProps,
        forwardedRef: ForwardedRef<HTMLButtonElement>
    ): JSX.Element {
        return (
            <Button ref={useForwardedRef(forwardedRef)} size={size} variant={variant} spacing={spacing} {...props} />
        );
    })
);
