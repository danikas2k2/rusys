import { Button, type ButtonProps } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import React, { type ForwardedRef, forwardRef } from 'react';

export const IconButton = forwardRef(function IconButton(
    { size = 'large', variant = 'plain', spacing = 'none', ...props }: ButtonProps,
    forwardedRef: ForwardedRef<HTMLButtonElement>
) {
    return <Button ref={useForwardedRef(forwardedRef)} size={size} variant={variant} spacing={spacing} {...props} />;
});
