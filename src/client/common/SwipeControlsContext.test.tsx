import { renderHook } from '@testing-library/react';

import React, { act, use } from 'react';

import { SwipeControlsContext, SwipeControlsWrapper, useSwipePanelWidth } from '~/client/common/SwipeControlsContext';

describe('<SwipeControlsContext>', () => {
    it('uses context with default value', () => {
        const { result } = renderHook(() => use(SwipeControlsContext));

        expect(result.current).toStrictEqual([0, expect.any(Function)]);
    });
});

describe('useSwipePanelWidth', () => {
    it('returns default width', () => {
        const { result } = renderHook(() => useSwipePanelWidth());

        expect(result.current).toStrictEqual([0, expect.any(Function)]);
    });

    it('returns custom width from context', () => {
        const setWidth = jest.fn();

        const { result } = renderHook(() => useSwipePanelWidth(), {
            wrapper: ({ children }) => <SwipeControlsContext value={[100, setWidth]}>{children}</SwipeControlsContext>,
        });

        expect(result.current).toStrictEqual([100, setWidth]);
    });
});

describe('<SwipeControlsWrapper>', () => {
    it('provides state to children', () => {
        const { result } = renderHook(() => useSwipePanelWidth(), {
            wrapper: SwipeControlsWrapper,
        });

        expect(result.current[0]).toBe(0);
        expect(result.current[1]).toBeInstanceOf(Function);
    });

    it('updates width state', () => {
        const { result } = renderHook(() => useSwipePanelWidth(), {
            wrapper: SwipeControlsWrapper,
        });

        act(() => result.current[1](250));

        expect(result.current[0]).toBe(250);
    });
});
