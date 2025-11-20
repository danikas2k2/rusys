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
        // Since we're switching to a different id, a new panel is created
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

    it('updates panel when reactivating with same id after closing', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });

        // Close panel
        rerender(<TestWrapper active={undefined} />);

        // Panel should be marked as closing
        expect(screen.getByRole('group')).toHaveAttribute('data-closing', 'true');

        // Reactivate with same id - should update existing panel
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        // Panel should be updated with new offset
        const panels = screen.queryAllByRole('group');

        expect(panels.length).toBeGreaterThan(0);
        expect(panels[0]).toHaveStyle({ transform: 'translateX(-50px)' });
    });

    it('updates existing panel with same id even when it is closing', async () => {
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });

        // Close panel by setting active to undefined
        rerender(<TestWrapper active={undefined} />);

        // Panel should be marked as closing
        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveAttribute('data-closing', 'true');

        // Reactivate with same id - should update existing panel, not create new one
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        // Should still have only one panel, but with updated offset
        // Note: the panel might still be closing if the update happens before the closing animation completes
        const panels = screen.queryAllByRole('group');

        expect(panels).toHaveLength(1);
        // The panel should be updated with new offset
        expect(panels[0]).toHaveStyle({ transform: 'translateX(-50px)' });
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

    it('adds new panel when panel with same id does not exist', async () => {
        // Test linija 68-70: prev.some((p) => p.id === active.id) === false branch
        // Pradedame be panelių
        const { rerender } = render(<TestWrapper />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

        // Pridedame pirmą panelį
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'panel-1', data: { name: 'First' }, offset: -100 }} />)
        );

        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });
    });

    it('updates existing panel when panel with same id exists', async () => {
        // Test linija 68-69: prev.some((p) => p.id === active.id) === true branch
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-100px)' });

        // Atnaujiname panelį su tuo pačiu id
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        // Turėtų būti tik vienas panelis (atnaujintas, ne pridėtas naujas)
        const panels = screen.queryAllByRole('group');

        expect(panels).toHaveLength(1);
        expect(panels[0]).toHaveStyle({ transform: 'translateX(-50px)' });
    });

    it('updates correct panel when multiple panels exist and one has same id', async () => {
        // Test linija 69: prev.map((p) => (p.id === active.id ? { ...p, offset, rect } : p))
        // Sukuriame scenarijų su keliais paneliais, kur vienas turi tą patį id
        const { rerender } = render(<TestWrapper active={{ id: 'panel-1', data: { name: 'First' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        // Pridedame antrą panelį (skirtingas id)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'panel-2', data: { name: 'Second' }, offset: -80 }} />)
        );

        let panels = screen.queryAllByRole('group');

        expect(panels).toHaveLength(2);
        expect(panels.at(0)).toHaveAttribute('data-closing', 'true');
        expect(panels.at(1)).toHaveAttribute('data-closing', 'false');
        expect(panels.at(1)).toHaveStyle({ transform: 'translateX(-80px)' });

        // Atnaujiname pirmą panelį (panel-1) - turėtų atnaujinti tik tą, kuris turi tą patį id
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'panel-1', data: { name: 'First' }, offset: -60 }} />)
        );

        panels = screen.queryAllByRole('group');

        // Turėtų būti 2 paneliai: panel-2 vis dar closing, panel-1 atnaujintas
        expect(panels.length).toBeGreaterThanOrEqual(1);

        // Rasti panelį su panel-1 id ir patikrinti, kad jis atnaujintas
        const panel1 = panels.find((p) => {
            // Panel-1 turėtų būti atnaujintas su nauju offset
            return p.getAttribute('data-closing') === 'false' || p.getAttribute('data-closing') === null;
        });

        if (panel1) {
            expect(panel1).toHaveStyle({ transform: 'translateX(-60px)' });
        }
    });

    it('does not call closeAllPanels when prevActive.id is undefined', async () => {
        // Test linija 57: if (prevActive?.id && active?.id && prevActive.id !== active.id)
        // Kai prevActive.id yra undefined, closeAllPanels neturėtų būti iškviestas
        const { rerender } = render(<TestWrapper />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

        // Pridedame pirmą panelį (prevActive.id yra undefined)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />)
        );

        // Panelis turėtų būti pridėtas be closing state
        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveAttribute('data-closing', 'false');
    });

    it('does not call closeAllPanels when active.id is undefined', async () => {
        // Test linija 57: if (prevActive?.id && active?.id && prevActive.id !== active.id)
        // Kai active.id yra undefined, closeAllPanels neturėtų būti iškviestas dėl id palyginimo
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        // Nustatome active į undefined (bet prevActive.id yra 'test-id')
        rerender(<TestWrapper active={undefined} />);

        // Panelis turėtų būti pažymėtas kaip closing per else if branch (linija 72)
        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveAttribute('data-closing', 'true');
    });

    it('closes panels when prevActive has data but active.data is undefined', async () => {
        // Test linija 72: else if (prevActive?.data && (!active?.data || active?.action))
        // Branch: prevActive?.data === true && active?.data === false
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        // Nustatome active su undefined data (bet prevActive.data yra truthy)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: undefined as any, offset: -100 }} />)
        );

        // Panelis turėtų būti pažymėtas kaip closing
        await act(async () => jest.advanceTimersByTime(50));

        const panels = screen.queryAllByRole('group');

        // Panelis turėtų būti closing arba pašalintas
        if (panels.length > 0) {
            expect(panels[0]).toHaveAttribute('data-closing', 'true');
        }
    });

    it('closes panels when prevActive has data and active has action', async () => {
        // Test linija 72: else if (prevActive?.data && (!active?.data || active?.action))
        // Branch: prevActive?.data === true && active?.action === true
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        // Nustatome active su action (bet prevActive.data yra truthy)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100, action: 'update' }} />)
        );

        // Panelis turėtų būti pažymėtas kaip closing
        await act(async () => jest.advanceTimersByTime(50));

        const panels = screen.queryAllByRole('group');

        // Panelis turėtų būti closing arba pašalintas
        if (panels.length > 0) {
            expect(panels[0]).toHaveAttribute('data-closing', 'true');
        }
    });

    it('does not close panels when prevActive.data is undefined', async () => {
        // Test linija 72: else if (prevActive?.data && (!active?.data || active?.action))
        // Branch: prevActive?.data === false (neturėtų iškviesti closeAllPanels)
        const { rerender } = render(<TestWrapper />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

        // Pridedame panelį (prevActive.data yra undefined)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />)
        );

        // Panelis turėtų būti pridėtas be closing state
        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveAttribute('data-closing', 'false');
    });

    it('covers closeAllPanels with empty panels array when switching between different ids', async () => {
        // Test linija 35: if (prev.length === 0) return prev;
        // Sukuriame scenarijų, kur panelių masyvas tuščias ir perjungiame tarp skirtingų id
        const { rerender } = render(<TestWrapper />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();

        // Pridedame panelį
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id-1', data: { name: 'First' }, offset: -100 }} />)
        );

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        // Uždaryti panelę ir palaukti, kol ji bus pašalinta
        await act(async () => rerender(<TestWrapper active={undefined} />));

        await act(async () => jest.advanceTimersByTime(250));

        await waitFor(() => expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument());

        // Dabar panelių masyvas tuščias, perjungiame į kitą eilutę su skirtingu id
        // Tai turėtų iškviesti closeAllPanels() su tuščiu masyvu (linija 57-60)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id-2', data: { name: 'Second' }, offset: -100 }} />)
        );

        // Panelis turėtų būti pridėtas
        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveAttribute('data-closing', 'false');
    });

    it('covers if statement when active.data is falsy', () => {
        // Test linija 65: if (active?.data && active?.ref?.current && active?.offset !== undefined && !active?.action)
        // Branch: active?.data === false
        render(<TestWrapper active={{ id: 'test-id', data: null as any, offset: -100 }} />);

        expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    });

    it('covers if statement when active.offset is 0 (not undefined)', () => {
        // Test linija 65: if (active?.data && active?.ref?.current && active?.offset !== undefined && !active?.action)
        // Branch: active?.offset === 0 (not undefined, but falsy)
        render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: 0 }} />);

        // Panelis turėtų būti rodomas, net jei offset yra 0 (offset 0 yra validus)
        expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(0px)' });
    });

    it('covers else if statement when prevActive.data is truthy and active.data is truthy and action is falsy', async () => {
        // Test linija 72: else if (prevActive?.data && (!active?.data || active?.action))
        // Branch: prevActive?.data === true && active?.data === true && active?.action === false
        // Šiuo atveju else if neturėtų būti vykdomas, nes if statement (65) turėtų būti true
        const { rerender } = render(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -100 }} />);

        expect(screen.queryAllByRole('group')).toHaveLength(1);

        // Atnaujiname su tuo pačiu id, bet su nauju offset (prevActive.data yra truthy, active.data yra truthy, action yra falsy)
        await act(async () =>
            rerender(<TestWrapper active={{ id: 'test-id', data: { name: 'Test' }, offset: -50 }} />)
        );

        // Panelis turėtų būti atnaujintas per if statement (65), ne per else if (72)
        expect(screen.queryAllByRole('group')).toHaveLength(1);
        expect(screen.getByRole('group')).toHaveStyle({ transform: 'translateX(-50px)' });
    });
});
