import React, { type JSX, type PropsWithChildren } from 'react';
import DangerousIcon from '@assets/dangerous.svg';
import cx from './Error.pcss';

export function Error({ children }: PropsWithChildren): JSX.Element {
    return (
        <div role="alert" className={cx('Error')}>
            <DangerousIcon />
            {children}
        </div>
    );
}
