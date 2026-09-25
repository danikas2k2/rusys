import { useCallback, useEffect, useRef, useState } from 'react';

import { useRefreshAll } from '~/components/runtime/RefreshContext';

const TRIGGER_DISTANCE = 60;
const MAX_DISTANCE = 90;
const DAMPING = 0.5;

export interface PullToRefreshState {
    mainRef: React.RefObject<HTMLElement | null>;
    distance: number;
    refreshing: boolean;
    dragging: boolean;
}

export function usePullToRefresh(): PullToRefreshState {
    const mainRef = useRef<HTMLElement>(null);
    const viewportRef = useRef<HTMLDivElement | null>(null);
    const refreshAll = useRefreshAll();

    const [distance, setDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const [dragging, setDragging] = useState(false);

    const startYRef = useRef<number | null>(null);
    const pullingRef = useRef(false);
    const refreshingRef = useRef(false);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (refreshingRef.current || e.touches.length !== 1) {
            return;
        }
        const viewport = viewportRef.current;
        if (!viewport || viewport.scrollTop > 0) {
            return;
        }
        startYRef.current = e.touches[0].clientY;
        pullingRef.current = true;
        setDragging(true);
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!pullingRef.current || startYRef.current === null) {
            return;
        }
        if ((viewportRef.current?.scrollTop ?? 0) > 0) {
            pullingRef.current = false;
            setDistance(0);
            return;
        }
        const dy = e.touches[0].clientY - startYRef.current;
        if (dy <= 0) {
            setDistance(0);
            return;
        }
        e.preventDefault();
        setDistance(Math.min(MAX_DISTANCE, dy * DAMPING));
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!pullingRef.current) {
            return;
        }
        pullingRef.current = false;
        startYRef.current = null;
        setDragging(false);

        setDistance((current) => {
            if (current >= TRIGGER_DISTANCE) {
                refreshingRef.current = true;
                setRefreshing(true);
                refreshAll().finally(() => {
                    refreshingRef.current = false;
                    setRefreshing(false);
                    setDistance(0);
                });
                return current;
            }
            return 0;
        });
    }, [refreshAll]);

    useEffect(() => {
        const viewport = mainRef.current?.querySelector<HTMLDivElement>('[data-scrollarea-viewport]');
        if (!viewport) {
            return;
        }
        viewportRef.current = viewport;

        viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
        viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
        viewport.addEventListener('touchend', handleTouchEnd, { passive: true });
        viewport.addEventListener('touchcancel', handleTouchEnd, { passive: true });

        return () => {
            viewportRef.current = null;
            viewport.removeEventListener('touchstart', handleTouchStart);
            viewport.removeEventListener('touchmove', handleTouchMove);
            viewport.removeEventListener('touchend', handleTouchEnd);
            viewport.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

    return { mainRef, distance: refreshing ? TRIGGER_DISTANCE : distance, refreshing, dragging };
}
