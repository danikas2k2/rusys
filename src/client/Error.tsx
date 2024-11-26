import DangerousIcon from '@assets/Dangerous.svg';
import React, { type PropsWithChildren } from 'react';
import cx from './Error.less';

export function Error({ children }: PropsWithChildren): JSX.Element {
    return (
        <div role="alert" className={cx('Error')}>
            <DangerousIcon />
            {children}
        </div>
    );
}
