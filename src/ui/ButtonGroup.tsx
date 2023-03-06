import type { CommonInputProps } from '@ui/Input';
import classNames from 'classnames';
import type { ForwardedRef } from 'react';
import React, { forwardRef, memo } from 'react';
import useForwardedRef from '~/ui/hooks/useForwardedRef';
import './ButtonGroup.less';

export default memo(
    forwardRef(function ButtonGroup(
        { className, ...props }: CommonInputProps<HTMLDivElement>,
        forwardedRef: ForwardedRef<HTMLDivElement>
    ): JSX.Element {
        const ref = useForwardedRef(forwardedRef);
        return <div ref={ref} className={classNames('ButtonGroup', className)} {...props} />;
    })
);
