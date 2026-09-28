import { renderHook } from '@testing-library/react';
import { MockActiveContent } from '@tests/MockActiveContent';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { useSwipeVisible } from '~/components/hooks/useSwipeVisible';
import { type ActiveContent } from '~/components/runtime/ActiveContentContext';

describe('useSwipeVisible', () => {
    it('defaults to hidden while rendering on the server', () => {
        function Indicator() {
            return <span>{String(useSwipeVisible())}</span>;
        }

        expect(
            renderToStaticMarkup(
                <MockActiveContent active={{ id: 'row', offset: 50 }}>
                    <Indicator />
                </MockActiveContent>
            )
        ).toContain('<span>false</span>');
    });

    it('returns false when active is undefined', () => {
        const { result } = renderHook(() => useSwipeVisible(), {
            wrapper: ({ children }) => <MockActiveContent>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns false when active.offset is undefined', () => {
        const active: ActiveContent = { id: 'test-1' };
        const { result } = renderHook(() => useSwipeVisible(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns false when active.offset is 0', () => {
        const active: ActiveContent = { id: 'test-1', offset: 0 };
        const { result } = renderHook(() => useSwipeVisible(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns false when active.action is defined', () => {
        const active: ActiveContent = { id: 'test-1', offset: -100, action: 'update' };
        const { result } = renderHook(() => useSwipeVisible(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns true when swipe panel is open', () => {
        const active: ActiveContent = { id: 'test-1', offset: -100 };
        const { result } = renderHook(() => useSwipeVisible(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(true);
    });

    it('returns true when swipe panel is open with positive offset', () => {
        const active: ActiveContent = { id: 'test-1', offset: 50 };
        const { result } = renderHook(() => useSwipeVisible(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(true);
    });
});
