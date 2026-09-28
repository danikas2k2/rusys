import React, { ViewTransition } from 'react';

import { RefreshIcon } from '@icons';

import { ScreenLoader } from '~/components/common/ScreenLoader';

import './PullToRefreshIndicator.css';

interface PullToRefreshIndicatorProps {
    distance: number;
    refreshing: boolean;
    dragging: boolean;
}

export function PullToRefreshIndicator({
    distance,
    refreshing,
    dragging,
    children,
}: React.PropsWithChildren<PullToRefreshIndicatorProps>): React.ReactElement {
    return (
        <>
            {refreshing && <ScreenLoader />}
            <div
                className="pull-to-refresh"
                data-dragging={dragging}
                data-pulling={distance > 0}
                style={{ '--pull-distance': `${distance}px` } as React.CSSProperties}
            >
                <div className="pull-to-refresh-indicator">{!refreshing && <RefreshIcon size={20} />}</div>
                <ViewTransition enter="page-enter" exit="page-exit" default="none">
                    <div className="pull-to-refresh-content">{children}</div>
                </ViewTransition>
            </div>
        </>
    );
}
