import { type CommonInputProps } from '@ui/Input';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { type ForwardedRef, forwardRef, memo } from 'react';
import useForwardedRef from '~/ui/hooks/useForwardedRef';
import './ButtonGroup.less';

export default memo(
    forwardRef(function ButtonGroup(
        { className, ...props }: CommonInputProps<HTMLDivElement>,
        forwardedRef: ForwardedRef<HTMLDivElement>
    ) {
        const ref = useForwardedRef(forwardedRef);
        return <div ref={ref} className={classNames('ButtonGroup', className)} {...props} />;
    }),
    isEqual
);
