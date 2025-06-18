import React from 'react';
import cx from './Loader.pcss';

export function Loader() {
    return (
        <div className={cx('Loader')} role="progressbar">
            <div key="0" />
            <div key="1" />
            <div key="2" />
            <div key="3" />
        </div>
    );
}
