import { type ButtonProps } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import Interactive from '@ui/Interactive';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { type ForwardedRef, forwardRef, memo } from 'react';
import './MenuItem.less';

interface MenuItemProps extends ButtonProps {
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
}

export default memo(
    forwardRef(function MenuItem(
        { className, children, startDecorator, endDecorator, ...props }: MenuItemProps,
        forwardedRef: ForwardedRef<HTMLDivElement>
    ) {
        return (
            <Interactive
                ref={useForwardedRef(forwardedRef)}
                role="menuitem"
                className={classNames('MenuItem', className)}
                {...props}
            >
                {startDecorator && <div className="start-decorator">{startDecorator}</div>}
                <div className="content">{children}</div>
                {endDecorator && <div className="end-decorator">{endDecorator}</div>}
            </Interactive>
        );
    }),
    isEqual
);
