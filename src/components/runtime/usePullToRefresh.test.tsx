import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';

import React from 'react';

import { useRefreshAll } from '~/components/runtime/RefreshContext';
import { usePullToRefresh } from '~/components/runtime/usePullToRefresh';

vi.mock(import('~/components/runtime/RefreshContext'), () => ({
    useRefreshAll: vi.fn(),
}));

function Harness() {
    const { mainRef, distance, refreshing, dragging } = usePullToRefresh();

    return (
        <div ref={mainRef as React.RefObject<HTMLDivElement>}>
            <section data-scrollarea-viewport aria-label="Scroll viewport" />
            <output aria-label="Pull distance">{distance}</output>
            <output aria-label="Refreshing">{String(refreshing)}</output>
            <output aria-label="Dragging">{String(dragging)}</output>
        </div>
    );
}

function touch(clientY: number) {
    return { touches: [{ clientY }] };
}

describe('usePullToRefresh', () => {
    let refreshAll: Mock<() => Promise<void>>;

    beforeEach(() => {
        refreshAll = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
        vi.mocked(useRefreshAll).mockReturnValue(refreshAll);
    });

    it('does not track a pull that starts when the viewport is already scrolled', () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 10;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(100));
        });

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
        expect(screen.getByLabelText('Dragging')).toHaveTextContent('false');
    });

    it('grows the pull distance (with damping) as the finger drags down from the top', () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(40));
        });

        expect(screen.getByLabelText('Dragging')).toHaveTextContent('true');
        // 40px of travel is damped (see DAMPING = 0.5 in usePullToRefresh.ts)
        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('20');
    });

    it('caps the pull distance at the configured maximum', () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(1000));
        });

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('90');
    });

    it('resets the pull distance to 0 when the finger drags back up past the start', () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(40));
            fireEvent.touchMove(viewport, touch(-10));
        });

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
    });

    it('snaps back without refreshing when released below the trigger threshold', async () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        await act(async () => {
            fireEvent.touchStart(viewport, touch(0));
            // 50px travel * 0.5 damping = 25px, below the 60px trigger threshold
            fireEvent.touchMove(viewport, touch(50));
            fireEvent.touchEnd(viewport, touch(50));
        });

        expect(refreshAll).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
        expect(screen.getByLabelText('Refreshing')).toHaveTextContent('false');
        expect(screen.getByLabelText('Dragging')).toHaveTextContent('false');
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
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            // 150px travel * 0.5 damping = 75px, past the 60px trigger threshold
            fireEvent.touchMove(viewport, touch(150));
            fireEvent.touchEnd(viewport, touch(150));
        });

        expect(refreshAll).toHaveBeenCalledTimes(1);
        expect(screen.getByLabelText('Refreshing')).toHaveTextContent('true');

        await act(async () => {
            resolveRefresh();
        });

        expect(screen.getByLabelText('Refreshing')).toHaveTextContent('false');
        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
    });

    it('stops tracking and resets distance if the viewport starts scrolling mid-drag', () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, touch(0));
            fireEvent.touchMove(viewport, touch(40));
        });

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('20');

        viewport.scrollTop = 5;

        act(() => {
            fireEvent.touchMove(viewport, touch(80));
        });

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');

        // Further movement is ignored since pullingRef was cleared
        act(() => {
            fireEvent.touchMove(viewport, touch(120));
        });

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
    });

    it('does nothing on touchend when no pull was in progress (e.g. a plain tap)', () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        act(() => fireEvent.touchEnd(viewport, touch(0)));

        expect(refreshAll).not.toHaveBeenCalled();
        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
    });

    it('does not attach touch listeners when the scroll-area viewport marker is missing', () => {
        function HarnessWithoutViewport() {
            const { mainRef, distance } = usePullToRefresh();
            return (
                <div ref={mainRef as React.RefObject<HTMLDivElement>}>
                    <main />
                    <output aria-label="Pull distance">{distance}</output>
                </div>
            );
        }

        render(<HarnessWithoutViewport />);
        const body = screen.getByRole('main');

        expect(() => {
            act(() => {
                fireEvent.touchStart(body, touch(0));
                fireEvent.touchMove(body, touch(100));
            });
        }).not.toThrow();

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
    });

    it('ignores multi-touch gestures', () => {
        render(<Harness />);
        const viewport = screen.getByRole('region', { name: 'Scroll viewport' });
        viewport.scrollTop = 0;

        act(() => {
            fireEvent.touchStart(viewport, { touches: [{ clientY: 0 }, { clientY: 0 }] });
            fireEvent.touchMove(viewport, touch(100));
        });

        expect(screen.getByLabelText('Pull distance')).toHaveTextContent('0');
        expect(screen.getByLabelText('Dragging')).toHaveTextContent('false');
    });
});
