import { act, render, screen, waitFor } from '@testing-library/react';
import { MockActiveContent } from '@tests/MockActiveContent';

import React, { useRef } from 'react';

import { SwipePanel } from '~/client/common/SwipePanel';

jest.mock('~/client/common/SwipeControlsContext', () => ({
    useSwipePanelWidth: jest.fn(() => [120, jest.fn()]),
}));

// Mock Portal to render children directly
jest.mock('@mantine/core', () => ({
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('<SwipePanel>', () => {
    const mockContainer = document.createElement('div');

    beforeEach(() => {
        jest.useFakeTimers();

        jest.spyOn(mockContainer, 'getBoundingClientRect').mockReturnValue({
            top: 100,
            left: 0,
            right: 200,
            bottom: 150,
            width: 200,
            height: 50,
            x: 0,
            y: 100,
            toJSON: () => ({}),
        });
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
});
