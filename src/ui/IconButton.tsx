import Button, { type ButtonProps } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { isEqual } from 'lodash';
import React, { type ForwardedRef, forwardRef, memo } from 'react';

export default memo(
    forwardRef(function IconButton(
        { size = 'large', variant = 'plain', spacing = 'none', ...props }: ButtonProps,
        forwardedRef: ForwardedRef<HTMLButtonElement>
    ) {
        return (
            <Button ref={useForwardedRef(forwardedRef)} size={size} variant={variant} spacing={spacing} {...props} />
        );
    }),
    isEqual
);
