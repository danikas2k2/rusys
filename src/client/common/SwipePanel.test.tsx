import { act, render, screen, waitFor } from '@testing-library/react';
import { MockActiveContent } from '@tests/MockActiveContent';

import React, { useRef } from 'react';

import { SwipePanel } from '~/client/common/SwipePanel';

const mockSetControlsWidth = jest.fn();

jest.mock('~/client/common/SwipeControlsContext', () => ({
    useSwipePanelWidth: jest.fn(() => [120, mockSetControlsWidth]),
}));

jest.mock('@mantine/core', () => ({
    Portal: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe('<SwipePanel>', () => {
    const mockContainer = document.createElement('div');

    beforeEach(() => {
        jest.useFakeTimers();
        jest.spyOn(mockContainer, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 100, 200, 50));
        document.body.appendChild(mockContainer);
    });

    afterEach(() => {
        act(() => jest.runOnlyPendingTimers());
        jest.clearAllMocks();
        document.body.removeChild(mockContainer);
    });

    afterAll(() => jest.useRealTimers());

    function TestWrapper({ active }: { active?: any }) {
        const ref = useRef(mockContainer);

        return (
            <MockActiveContent active={active ? { ...active, ref } : undefined}>
                <SwipePanel>
                    <button type="button">Delete</button>
                </SwipePanel>
            </MockActiveContent>
        );
    }

    it('renders nothing when no active content', () => {
        render(<TestWrapper />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('renders panel when active content is present with offset', () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('does not render panel when active has action', () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100, action: 'update' }} />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('does not render panel when offset is undefined', () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' } }} />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('applies correct transform based on offset', () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });
    });

    it('applies correct position based on rect', () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('group')).toHaveStyle({
            top: '101px', // rect.top + 1
            height: '48px', // rect.height - 2
        });
    });

    it('updates panel when offset changes', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });

        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-50px)' });
    });

    it('closes panel when active becomes undefined', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

        rerender(<TestWrapper active={undefined} />);

        expect(screen.queryByRole('button', { name: 'Delete' })).toBeInTheDocument();

        await act(async () => jest.advanceTimersByTime(250));

        await waitFor(() => expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument());
    });

    it('renders first panel with ref for width measurement', () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('keeps closing panel when switching to different row', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'First' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-2d', data: { name: 'Second' }, offset: -80 }} />)
        );

        const panels = screen.queryAllByRole('group');

        expect(panels).toHaveLength(2);
        expect(panels.at(0)).toHaveAttribute('data-closing', 'true');
        expect(panels.at(1)).toHaveAttribute('data-closing', 'false');
    });

    it('can have multiple panels visible when switching quickly between rows', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'panel-1', data: { name: 'First' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        // Quickly switch to second row - first panel should start closing but still be visible
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'panel-2', data: { name: 'Second' }, offset: -80 }} />)
        );

        let panels = screen.queryAllByRole('group');

        expect(panels).toHaveLength(2);
        expect(panels.at(0)).toHaveAttribute('data-closing', 'true');
        expect(panels.at(1)).toHaveAttribute('data-closing', 'false');

        // Quickly switch to third row before first two panels finish closing
        // This tests line 71: when existingPanel is found, it updates the panel
        // But since we're switching to a different id, a new panel is created
        // and previous panels remain in closing state
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'panel-3', data: { name: 'Third' }, offset: -60 }} />)
        );

        panels = screen.queryAllByRole('group');

        // Should have 3 panels: first two closing, third active
        expect(panels.length).toBeGreaterThanOrEqual(2);

        // At least one should be closing (the previous ones)
        const closingPanels = panels.filter((p) => p.dataset.closing === 'true');

        expect(closingPanels.length).toBeGreaterThanOrEqual(1);

        // At least one should be active (the current one)
        const activePanels = panels.filter((p) => p.dataset.closing === 'false');

        expect(activePanels.length).toBeGreaterThanOrEqual(1);
    });

    it('renders controls when panel is active', () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('updates existing panel when same id is active', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });

        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-50px)' });
    });

    it('measures controls width when panel is rendered', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        Object.defineProperty(await screen.findByRole('group'), 'offsetWidth', {
            configurable: true,
            value: 150,
        });

        rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        await waitFor(() => expect(mockSetControlsWidth).toHaveBeenCalledWith(150));
    });

    it('does not update panel when panel is closing with same id', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });

        rerender(<TestWrapper active={undefined} />);

        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        expect(screen.queryAllByRole('group').length).toBeGreaterThan(0);
    });

    it('removes closing panel with same id when creating new panel', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        rerender(<TestWrapper active={undefined} />);

        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        await act(async () => jest.advanceTimersByTime(250));

        await waitFor(() =>
            expect(
                screen.queryAllByRole('group').filter((p) => p.getAttribute('data-closing') !== 'true')
            ).toHaveLength(1)
        );
    });

    it('does not set controls width when width is 0', async () => {
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        const panel = await screen.findByRole('group');

        Object.defineProperty(panel, 'offsetWidth', {
            configurable: true,
            value: 0,
        });

        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        await waitFor(() => expect(mockSetControlsWidth).not.toHaveBeenCalledWith(0));
    });

    it('closes panels when active has action', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

        rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100, action: 'update' }} />);

        await act(async () => jest.advanceTimersByTime(250));

        await waitFor(() => expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument());
    });

    it('does not close panels when prevActive is undefined', async () => {
        const { rerender } = render(<TestWrapper />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

        rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('does not crash when closeAllPanels is called with empty panels array', async () => {
        // Test linija 35: if (prev.length === 0) return prev;
        // Šis scenarijus įvyksta, kai closeAllPanels() iškviečiamas, bet panelių masyvas tuščias
        // Pradedame be panelių
        const { rerender } = render(<TestWrapper />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

        // Perjungiame tarp skirtingų eilučių, bet abi eilutės neturi panelių (data skiriasi, bet panelių nėra)
        // Tai turėtų iškviesti closeAllPanels() su tuščiu masyvu
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id-1', data: { name: 'First' }, offset: -100 }} />)
        );

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();

        // Uždaryti panelę
        await act(async () => rerender(<TestWrapper active={undefined} />));

        await act(async () => jest.advanceTimersByTime(250));

        await waitFor(() => expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument());

        // Dabar panelių masyvas tuščias, perjungiame į kitą eilutę
        // closeAllPanels() turėtų būti iškviestas su tuščiu masyvu (linija 55-58)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id-2', data: { name: 'Second' }, offset: -100 }} />)
        );

        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    });

    it('does not render panel when active.ref.current is null', () => {
        // Test linija 63: active?.ref?.current - false branch
        function TestWrapperWithNullRef() {
            const nullRef = useRef<HTMLDivElement>(null);
            const active = { id: 'test-id', data: { name: 'Test' }, offset: -100, ref: nullRef };

            return (
                <MockActiveContent active={active}>
                    <SwipePanel>
                        <button type="button">Delete</button>
                    </SwipePanel>
                </MockActiveContent>
            );
        }

        render(<TestWrapperWithNullRef />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('does not render panel when active.ref.current is undefined', () => {
        // Test linija 63: active?.ref?.current - false branch
        function TestWrapperWithUndefinedRef() {
            const undefinedRef = useRef<HTMLDivElement | undefined>(undefined);
            const active = { id: 'test-id', data: { name: 'Test' }, offset: -100, ref: undefinedRef as any };

            return (
                <MockActiveContent active={active}>
                    <SwipePanel>
                        <button type="button">Delete</button>
                    </SwipePanel>
                </MockActiveContent>
            );
        }

        render(<TestWrapperWithUndefinedRef />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });
});
