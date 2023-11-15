import { isEqual } from 'lodash';
import React, { memo } from 'react';
import './Loader.less';

export default memo(function Loader() {
    return (
        <div className="Loader" role="progressbar">
            <div key="0" />
            <div key="1" />
            <div key="2" />
            <div key="3" />
        </div>
    );
}, isEqual);
