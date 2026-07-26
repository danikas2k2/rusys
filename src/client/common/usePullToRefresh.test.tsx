import { act, fireEvent, render, screen } from '@testing-library/react';

import React from 'react';

import { useRefreshAll } from '~/client/common/RefreshContext';
import { usePullToRefresh } from '~/client/common/usePullToRefresh';

vi.mock(import('~/client/common/RefreshContext'), () => ({
    useRefreshAll: vi.fn(),
}));

function Harness() {
    const { mainRef, distance, refreshing, dragging } = usePullToRefresh();

    return (
        <div ref={mainRef as React.RefObject<HTMLDivElement>}>
            <div data-scrollarea-viewport data-testid="viewport" />
            <div data-testid="distance">{distance}</div>
            <div data-testid="refreshing">{String(refreshing)}</div>
            <div data-testid="dragging">{String(dragging)}</div>
        </div>
    );
}

function touch(clientY: number) {
    return { touches: [{ clientY }] };
}

describe('usePullToRefresh', () => {
    let refreshAll: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        refreshAll = vi.fn().mockResolvedValue(undefined);
        vi.mocked(useRefreshAll).mockReturnValue(refreshAll);
    });

    it('does not track a pull that starts when the viewport is already scrolled', () => {
        render(<Harness />);
        const viewport = screen.getByTestId('viewport');
        viewport.scrollTop = 10;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(100));
        });

        expect(screen.getByTestId('distance')).toHaveTextContent('0');
        expect(screen.getByTestId('dragging')).toHaveTextContent('false');
    });

    it('grows the pull distance (with damping) as the finger drags down from the top', () => {
        render(<Harness />);
        const viewport = screen.getByTestId('viewport');
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(40));
        });

        expect(screen.getByTestId('dragging')).toHaveTextContent('true');
        // 40px of travel is damped (see DAMPING = 0.5 in usePullToRefresh.ts)
        expect(screen.getByTestId('distance')).toHaveTextContent('20');
    });

    it('caps the pull distance at the configured maximum', () => {
        render(<Harness />);
        const viewport = screen.getByTestId('viewport');
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(1000));
        });

        expect(screen.getByTestId('distance')).toHaveTextContent('90');
    });

    it('resets the pull distance to 0 when the finger drags back up past the start', () => {
        render(<Harness />);
        const viewport = screen.getByTestId('viewport');
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(40));
            fireEvent.touchMove(viewport, touch(-10));
        });

        expect(screen.getByTestId('distance')).toHaveTextContent('0');
    });

    it('snaps back without refreshing when released below the trigger threshold', async () => {
        render(<Harness />);
        const viewport = screen.getByTestId('viewport');
        viewport.scrollTop = 0;

        await act(async () => {
            fireEvent.touchStart(viewport, touch(0));
            // 50px travel * 0.5 damping = 25px, below the 60px trigger threshold
            fireEvent.touchMove(viewport, touch(50));
            fireEvent.touchEnd(viewport, touch(50));
        });

        expect(refreshAll).not.toHaveBeenCalled();
        expect(screen.getByTestId('distance')).toHaveTextContent('0');
        expect(screen.getByTestId('refreshing')).toHaveTextContent('false');
        expect(screen.getByTestId('dragging')).toHaveTextContent('false');
    });

    it('triggers a refresh and reports refreshing when released past the trigger threshold', async () => {
        let resolveRefresh: () => void;
        refreshAll.mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveRefresh = resolve;
                })
        );

        render(<Harness />);
        const viewport = screen.getByTestId('viewport');
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            // 150px travel * 0.5 damping = 75px, past the 60px trigger threshold
            fireEvent.touchMove(viewport, touch(150));
            fireEvent.touchEnd(viewport, touch(150));
        });

        expect(refreshAll).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('refreshing')).toHaveTextContent('true');

        await act(async () => {
            resolveRefresh();
        });

        expect(screen.getByTestId('refreshing')).toHaveTextContent('false');
        expect(screen.getByTestId('distance')).toHaveTextContent('0');
    });

    it('ignores multi-touch gestures', () => {
        render(<Harness />);
        const viewport = screen.getByTestId('viewport');
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, { touches: [{ clientY: 0 }, { clientY: 0 }] });
            fireEvent.touchMove(viewport, touch(100));
        });

        expect(screen.getByTestId('distance')).toHaveTextContent('0');
        expect(screen.getByTestId('dragging')).toHaveTextContent('false');
    });
});
