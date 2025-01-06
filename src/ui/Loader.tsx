import { isEqual } from 'lodash';
import React, { memo } from 'react';
import cx from './Loader.less';

export default memo(function Loader() {
    return (
        <div className={cx('Loader')}>
            <div key="0" />
            <div key="1" />
            <div key="2" />
            <div key="3" />
        </div>
    );
}, isEqual);
