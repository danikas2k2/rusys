import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ActiveDragHandle } from '~/client/common/ActiveDragHandle';
import { withActiveRowContext } from '~/tests/withActiveRowContext';

describe('ActiveDragHandle', () => {
    it('renders drag button', () => {
        render(<ActiveDragHandle />);
        expect(screen.getByRole('button', { name: 'Drag' })).not.toHaveClass('dragging');
    });

    it('renders drag button with dragging state', () => {
        render(<ActiveDragHandle dragging />);
        expect(screen.getByRole('button', { name: 'Drag' })).toHaveClass('dragging');
    });

    it('removes active state on pointer down event', async () => {
        const setActiveRow = jest.fn();
        render(<ActiveDragHandle />, withActiveRowContext(null, setActiveRow));
        const target = screen.getByRole('button', { name: 'Drag' });
        await userEvent.pointer([{ target, keys: '[MouseLeft>]' }]);
        expect(setActiveRow).toHaveBeenCalledWith(undefined);
    });

    it('calls onPointerDown passed handler', async () => {
        const onPointerDown = jest.fn();
        render(<ActiveDragHandle onPointerDown={onPointerDown} />, withActiveRowContext());
        const target = screen.getByRole('button', { name: 'Drag' });
        await userEvent.pointer([{ target, keys: '[MouseLeft>]' }]);
        expect(onPointerDown).toHaveBeenCalled();
    });
});
