import React, { type JSX, memo } from 'react';
import './Loader.less';

export default memo(function Loader(): JSX.Element {
    return (
        <div className="Loader">
            <div key="0" />
            <div key="1" />
            <div key="2" />
            <div key="3" />
        </div>
    );
});
