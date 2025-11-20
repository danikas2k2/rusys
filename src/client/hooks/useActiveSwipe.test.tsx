import { renderHook } from '@testing-library/react';
import { MockActiveContent } from '@tests/MockActiveContent';

import React from 'react';

import { type ActiveContent } from '~/client/common/ActiveContentContext';
import { useActiveSwipe } from '~/client/hooks/useActiveSwipe';

describe('useActiveSwipe', () => {
    it('returns false when active is undefined', () => {
        const { result } = renderHook(() => useActiveSwipe(), {
            wrapper: ({ children }) => <MockActiveContent>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns false when active.data is undefined', () => {
        const active: ActiveContent = { id: 'test-1' };
        const { result } = renderHook(() => useActiveSwipe(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns false when active.offset is undefined', () => {
        const active: ActiveContent = { id: 'test-1', data: { group: 'Test' } };
        const { result } = renderHook(() => useActiveSwipe(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns false when active.offset is 0', () => {
        const active: ActiveContent = { id: 'test-1', data: { group: 'Test' }, offset: 0 };
        const { result } = renderHook(() => useActiveSwipe(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns false when active.action is defined', () => {
        const active: ActiveContent = { id: 'test-1', data: { group: 'Test' }, offset: -100, action: 'update' };
        const { result } = renderHook(() => useActiveSwipe(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(false);
    });

    it('returns true when swipe panel is open', () => {
        const active: ActiveContent = { id: 'test-1', data: { group: 'Test' }, offset: -100 };
        const { result } = renderHook(() => useActiveSwipe(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(true);
    });

    it('returns true when swipe panel is open with positive offset', () => {
        const active: ActiveContent = { id: 'test-1', data: { group: 'Test' }, offset: 50 };
        const { result } = renderHook(() => useActiveSwipe(), {
            wrapper: ({ children }) => <MockActiveContent active={active}>{children}</MockActiveContent>,
        });

        expect(result.current).toBe(true);
    });
});
