import { act, render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { MockApp } from '@tests/MockApp';

import React from 'react';

import { ToolbarFilter } from '~/components/toolbar/ToolbarFilter';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { trackFaroEvent } from '~/lib/observability/faro';

vi.mock(import('~/features/filters/QuickFilterContext'), () => ({
    useQuickFilter: vi.fn(),
}));
vi.mock(import('~/lib/observability/faro'));

describe('<ToolbarFilter>', () => {
    const setFilter = vi.fn();

    beforeEach(() => {
        vi.mocked(useQuickFilter).mockReturnValue(['', setFilter]);
    });

    afterEach(() => vi.clearAllMocks());

    it('renders input field with placeholder', () => {
        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        expect(screen.getByPlaceholderText('type to filter')).toBeInTheDocument();
    });

    it('updates filter value when input field is changed', async () => {
        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        await user.type(screen.getByPlaceholderText('type to filter'), 'x');

        expect(setFilter).toHaveBeenCalledWith('x');
    });

    it('clears filter value when clear button is clicked', async () => {
        vi.mocked(useQuickFilter).mockReturnValue(['x', setFilter]);

        render(
            <MockApp>
                <ToolbarFilter />
            </MockApp>
        );

        const input = screen.getByPlaceholderText('type to filter');
        await user.click(screen.getByRole('button', { name: 'Clear' }));

        expect(setFilter).toHaveBeenCalledWith('');
        expect(input).toHaveFocus();
    });

    describe('debounced search diagnostics', () => {
        beforeEach(() => vi.useFakeTimers());

        afterEach(() => vi.useRealTimers());

        function renderFilter() {
            const view = render(<ToolbarFilter />, { wrapper: MockApp });
            return {
                ...view,
                changeFilter(value: string) {
                    vi.mocked(useQuickFilter).mockReturnValue([value, setFilter]);
                    view.rerender(<ToolbarFilter />);
                },
            };
        }

        function advance(milliseconds: number) {
            act(() => vi.advanceTimersByTime(milliseconds));
        }

        it('waits for a full quiet period after the latest filter change', () => {
            const view = renderFilter();
            view.changeFilter('private first');
            advance(700);
            view.changeFilter('private latest');
            advance(999);

            expect(trackFaroEvent).not.toHaveBeenCalled();

            advance(1);

            expect(trackFaroEvent).toHaveBeenCalledExactlyOnceWith('search_performed');

            advance(5000);

            expect(trackFaroEvent).toHaveBeenCalledTimes(1);
        });

        it.each(['', '   '])('cancels a pending event when the filter becomes empty: %j', (empty) => {
            const view = renderFilter();
            view.changeFilter('private query');
            advance(900);
            view.changeFilter(empty);
            advance(2000);

            expect(trackFaroEvent).not.toHaveBeenCalled();
        });

        it('cancels a pending event when unmounted', () => {
            const view = renderFilter();
            view.changeFilter('private query');
            advance(900);
            view.unmount();
            advance(2000);

            expect(trackFaroEvent).not.toHaveBeenCalled();
        });

        it('does not report the initial empty filter', () => {
            renderFilter();
            advance(2000);

            expect(trackFaroEvent).not.toHaveBeenCalled();
        });

        it('reports another burst ending at the same query without including search text or attributes', () => {
            const view = renderFilter();
            view.changeFilter('private first');
            advance(1000);
            view.changeFilter('private second');
            advance(500);
            view.changeFilter('private first');
            advance(1000);

            expect(vi.mocked(trackFaroEvent).mock.calls).toStrictEqual([['search_performed'], ['search_performed']]);
        });
    });
});
